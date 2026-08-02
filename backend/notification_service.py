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
    notification = Notification(
        type=notification_type,
        severity=severity,
        title=title,
        message=message,
        repository=repository,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification