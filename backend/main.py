from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from github_client import get_issues, get_org_repos
from normalize import normalize_issue, compute_hash
from database import get_db, engine, Base
from models import Connector, SyncRun, Record, RecordChange, User
from auth import hash_password, verify_password, create_access_token, get_current_user
from ai_insights import ask_question, summarize_sync

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "SyncGuard backend is alive"}

@app.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(email=email, hashed_password=hash_password(password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": user.email, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/issues/{owner}/{repo}")
def fetch_issues(owner: str, repo: str):
    issues = get_issues(owner, repo)
    if issues is None:
        return {"error": "Could not fetch issues"}
    return {"count": len(issues), "issues": issues}

def run_sync(owner: str, repo: str, db: Session) -> dict:
    """Reusable sync logic for a single repo. Used by both single-repo and org-wide sync."""
    connector = db.query(Connector).filter(Connector.name == "GitHub").first()
    if connector is None:
        connector = Connector(name="GitHub", status="connected")
        db.add(connector)
        db.commit()
        db.refresh(connector)

    sync_run = SyncRun(connector_id=connector.id, status="running")
    db.add(sync_run)
    db.commit()
    db.refresh(sync_run)

    raw_issues = get_issues(owner, repo)
    if raw_issues is None:
        sync_run.status = "failed"
        sync_run.finished_at = datetime.now(timezone.utc)
        db.commit()
        return {"error": f"Failed to fetch from GitHub for {owner}/{repo}", "repo": repo}

    changes_count = 0

    for raw_issue in raw_issues:
        normalized = normalize_issue(raw_issue, connector.id)
        new_hash = compute_hash(normalized)

        existing = db.query(Record).filter(
            Record.connector_id == connector.id,
            Record.external_id == normalized["external_id"]
        ).first()

        if existing is None:
            new_record = Record(
                connector_id=connector.id,
                external_id=normalized["external_id"],
                title=normalized["title"],
                status=normalized["status"],
                owner=normalized["owner"],
                data_hash=new_hash,
            )
            db.add(new_record)
            db.commit()
            db.refresh(new_record)

            change = RecordChange(
                record_id=new_record.id,
                sync_run_id=sync_run.id,
                change_type="created"
            )
            db.add(change)
            changes_count += 1

        elif existing.data_hash != new_hash:
            existing.title = normalized["title"]
            existing.status = normalized["status"]
            existing.owner = normalized["owner"]
            existing.data_hash = new_hash
            db.commit()

            change = RecordChange(
                record_id=existing.id,
                sync_run_id=sync_run.id,
                change_type="updated"
            )
            db.add(change)
            changes_count += 1

    db.commit()

    sync_run.status = "success"
    sync_run.finished_at = datetime.now(timezone.utc)
    sync_run.records_changed = changes_count
    connector.last_synced_at = datetime.now(timezone.utc)
    db.commit()

    summary = summarize_sync(changes_count, len(raw_issues))

    return {
        "repo": repo,
        "sync_run_id": sync_run.id,
        "records_changed": changes_count,
        "total_fetched": len(raw_issues),
        "summary": summary
    }

@app.post("/sync/{owner}/{repo}")
def sync_repo(owner: str, repo: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return run_sync(owner, repo, db)

@app.post("/sync-org/{org}")
def sync_org(org: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Syncs every repo under a GitHub organization, one by one."""
    repos = get_org_repos(org)
    if repos is None:
        raise HTTPException(status_code=400, detail=f"Could not fetch repos for org '{org}'")

    results = []
    total_changed = 0
    total_fetched = 0

    for repo_data in repos:
        repo_name = repo_data["name"]
        result = run_sync(org, repo_name, db)
        results.append(result)
        total_changed += result.get("records_changed", 0)
        total_fetched += result.get("total_fetched", 0)

    return {
        "organization": org,
        "repos_synced": len(results),
        "total_records_changed": total_changed,
        "total_fetched": total_fetched,
        "details": results
    }

@app.get("/records")
def get_records(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    records = db.query(Record).all()
    return [{"id": r.id, "title": r.title, "status": r.status, "owner": r.owner} for r in records]

@app.get("/sync-history")
def get_sync_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    runs = db.query(SyncRun).order_by(SyncRun.started_at.desc()).all()
    return [{"id": r.id, "status": r.status, "records_changed": r.records_changed, "started_at": r.started_at} for r in runs]

@app.get("/activity")
def get_activity(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Groups records by owner — shows who's associated with the most activity."""
    results = (
        db.query(Record.owner, func.count(Record.id).label("record_count"))
        .group_by(Record.owner)
        .order_by(func.count(Record.id).desc())
        .limit(10)
        .all()
    )
    return [{"owner": r[0], "record_count": r[1]} for r in results]

@app.post("/ask")
def ask(question: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = ask_question(question, db)
    return result