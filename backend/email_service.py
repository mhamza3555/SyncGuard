import os
import boto3
from dotenv import load_dotenv

load_dotenv()

print("AWS_REGION =", os.getenv("AWS_REGION"))
print("SENDER =", os.getenv("SES_SENDER_EMAIL"))

ses = boto3.client(
    "ses",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

SENDER = os.getenv("SES_SENDER_EMAIL")


def send_email(recipient: str, subject: str, body: str):
    response = ses.send_email(
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

    return response