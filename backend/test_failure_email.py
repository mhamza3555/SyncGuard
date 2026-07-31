from email_service import send_failure_alert

response = send_failure_alert(
    connector="GitHub",
    repository="octocat/Hello-World",
    reason="GitHub API returned HTTP 403 (Rate Limit Exceeded)."
)

print(response)