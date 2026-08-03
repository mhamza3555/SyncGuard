from models import Notification
from sqlalchemy.orm import Session


def create_notification(
    db: Session,
    notification_type: str,
    severity: str,
    title: str,
    message: str,
    repository: str | None = None,
):
    # Include the repository name in the title instead of storing it
    if repository:
        title = f"{title} ({repository})"

    notification = Notification(
        type=notification_type,
        severity=severity,
        title=title,
        message=message,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification