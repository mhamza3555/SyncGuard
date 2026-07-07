from fastapi import FastAPI
from github_client import get_issues

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "SyncGuard backend is alive"}

@app.get("/issues/{owner}/{repo}")
def fetch_issues(owner: str, repo: str):
    issues = get_issues(owner, repo)
    if issues is None:
        return {"error": "Could not fetch issues"}
    return {"count": len(issues), "issues": issues}