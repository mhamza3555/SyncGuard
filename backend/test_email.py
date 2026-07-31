from email_service import send_email

response = send_email(
    recipient="mhamza3555@gmail.com",
    subject="SyncGuard SES Test",
    body="Congratulations! Your SyncGuard project successfully sent an email using Amazon SES."
)

print(response)