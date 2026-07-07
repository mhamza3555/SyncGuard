import os
import requests
from dotenv import load_dotenv

# Load variables from .env into the environment
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
print(f"Token loaded: {GITHUB_TOKEN[:10] if GITHUB_TOKEN else 'NONE'}...")
BASE_URL = "https://api.github.com"

def get_headers():
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }

def get_issues(owner: str, repo: str):
    url = f"{BASE_URL}/repos/{owner}/{repo}/issues"
    response = requests.get(url, headers=get_headers())
    
    # Print rate limit info so we can monitor it
    remaining = response.headers.get("X-RateLimit-Remaining")
    reset = response.headers.get("X-RateLimit-Reset")
    print(f"Rate limit remaining: {remaining}")
    print(f"Resets at (unix timestamp): {reset}")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

if __name__ == "__main__":
    # Test with a real public repo — using GitHub's own "hello-world" repo as an example
    issues = get_issues("octocat", "Hello-World")
    if issues:
        print(f"Fetched {len(issues)} issues")
        for issue in issues[:3]:  # just print first 3 as a sample
            print(f"- #{issue['number']}: {issue['title']}")