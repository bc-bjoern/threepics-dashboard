import sys
import requests
import json

# OAuth credentials from your config
CLIENT_ID = ""
CLIENT_SECRET = "-xHTfCY9bZj9ou7l6-6Yb7NUV5kNAuBbM"
TOKEN_URL = "https://three-pics.com/o/token/"  # OAuth token endpoint

# API endpoint to mark media as to be deleted
API_URL = "http://threepics:8000/api/mark-to-delete/"

def get_access_token():
    data = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'read write',  # Use your needed scopes here
    }
    print(f"Requesting access token from {TOKEN_URL} with client_id={CLIENT_ID}")
    response = requests.post(TOKEN_URL, data=data)
    print(f"Token response status: {response.status_code}")
    print(f"Token response headers: {response.headers}")
    print(f"Token response body: {response.text}")
    response.raise_for_status()
    token_data = response.json()
    access_token = token_data.get('access_token')
    print(f"Access token received: {access_token}")
    return access_token

def mark_media_to_delete(access_token, filename):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    data = {
        "filename": filename,
    }
    response = requests.post(API_URL, json=data, headers=headers)
    if response.status_code == 200:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise Exception("Filename argument required")
        filename = sys.argv[1]

        token = get_access_token()
        mark_media_to_delete(token, filename)
    except Exception as e:
        print("Error:", e)
