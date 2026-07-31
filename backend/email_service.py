import os
import boto3
from dotenv import load_dotenv

load_dotenv()

ses = boto3.client(
    "ses",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

SENDER = os.getenv("SES_SENDER_EMAIL")
ALERT_EMAIL = os.getenv("ALERT_EMAIL")


def send_email(recipient: str, subject: str, body: str):
    """
    Generic SES email sender.
    """

    return ses.send_email(
        Source=SENDER,
        Destination={
            "ToAddresses": [recipient]
        },
        Message={
            "Subject": {
                "Data": subject
            },
            "Body": {
                "Text": {
                    "Data": body
                }
            }
        }
    )


def send_failure_alert(
    connector: str,
    repository: str,
    reason: str,
):
    """
    Sends a connector failure notification.
    """

    subject = f"SyncGuard Alert: {connector} Sync Failed"

    body = f"""
SyncGuard Connector Failure

Connector:
{connector}

Repository:
{repository}

Status:
FAILED

Reason:
{reason}

Action:
Please review the connector and investigate the failure.

-----------------------------------
Generated automatically by SyncGuard
"""

    return send_email(
        recipient=ALERT_EMAIL,
        subject=subject,
        body=body,
    )


def send_anomaly_alert(
    connector: str,
    repository: str,
    records_changed: int,
    explanation: str,
):
    """
    Sends an anomaly notification email.
    """

    subject = f"🚨 SyncGuard Alert: Unusual Activity Detected ({repository})"

    body = f"""
SyncGuard Connector Alert

Connector:
{connector}

Repository:
{repository}

Status:
ANOMALY DETECTED

Records Changed:
{records_changed}

AI Explanation:
{explanation}

Recommendation:
Review the SyncGuard dashboard for more details.

-----------------------------------
Generated automatically by SyncGuard
"""

    return send_email(
        recipient=ALERT_EMAIL,
        subject=subject,
        body=body,
    )
