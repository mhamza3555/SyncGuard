from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from github_client import get_issues
from normalize import normalize_issue, compute_hash
from database import get_db, engine, Base
from models import Connector, SyncRun, Record, RecordChange

app = FastAPI()

# Make sure tables exist when the app starts
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "SyncGuard backend is alive"}

@app.get("/issues/{owner}/{repo}")
def fetch_issues(owner: str, repo: str):
    issues = get_issues(owner, repo)
    if issues is None:
        return {"error": "Could not fetch issues"}
    return {"count": len(issues), "issues": issues}

@app.post("/sync/{owner}/{repo}")
def sync_repo(owner: str, repo: str, db: Session = Depends(get_db)):
    # 1. Find or create the connector entry
    connector = db.query(Connector).filter(Connector.name == "GitHub").first()
    if connector is None:
        connector = Connector(name="GitHub", status="connected")
        db.add(connector)
        db.commit()
        db.refresh(connector)

    # 2. Create a new sync run to track this attempt
    sync_run = SyncRun(connector_id=connector.id, status="running")
    db.add(sync_run)
    db.commit()
    db.refresh(sync_run)

    # 3. Fetch raw data from GitHub
    raw_issues = get_issues(owner, repo)
    if raw_issues is None:
        sync_run.status = "failed"
        sync_run.finished_at = datetime.now(timezone.utc)
        db.commit()
        return {"error": "Failed to fetch from GitHub"}

    changes_count = 0

    # 4. Go through each issue: normalize, hash, compare, save
    for raw_issue in raw_issues:
        normalized = normalize_issue(raw_issue, connector.id)
        new_hash = compute_hash(normalized)

        existing = db.query(Record).filter(
            Record.connector_id == connector.id,
            Record.external_id == normalized["external_id"]
        ).first()

        if existing is None:
            # Brand new record
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
            # Changed record
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

        # else: hash matches, do nothing — this is delta detection in action

    db.commit()

    # 5. Finalize the sync run
    sync_run.status = "success"
    sync_run.finished_at = datetime.now(timezone.utc)
    sync_run.records_changed = changes_count
    connector.last_synced_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "sync_run_id": sync_run.id,
        "records_changed": changes_count,
        "total_fetched": len(raw_issues)
    }