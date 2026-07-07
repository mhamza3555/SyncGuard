import hashlib
import json

def normalize_issue(raw_issue: dict, connector_id: int) -> dict:
    """
    Converts a raw GitHub issue (whatever shape GitHub sends)
    into our own clean, unified format.
    """
    normalized = {
        "connector_id": connector_id,
        "external_id": str(raw_issue["id"]),
        "title": raw_issue["title"],
        "status": raw_issue["state"],  # GitHub calls it "state" (open/closed), we call it "status"
        "owner": raw_issue["user"]["login"] if raw_issue.get("user") else "unknown",
    }
    return normalized

def compute_hash(normalized_record: dict) -> str:
    """
    Creates a fingerprint of the record's important fields.
    If this hash matches what's stored, nothing changed.
    """
    relevant_fields = {
        "title": normalized_record["title"],
        "status": normalized_record["status"],
        "owner": normalized_record["owner"],
    }
    record_str = json.dumps(relevant_fields, sort_keys=True)
    return hashlib.sha256(record_str.encode()).hexdigest()