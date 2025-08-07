#!/usr/bin/env python3
"""
threepics_upload.py

This script scans the local upload directory for image files, uploads them
to the ThreePics API using OAuth2 client credentials, and deletes each file
after a successful upload.

Requirements:
- credentials.json in ./config with client_id and client_secret
- Internet access
- requests library (installed automatically if missing)

Target folder:
    /opt/threepics/threepics-dashboard/backend/uploads

Author: Björn Becker
"""

import os
import sys
import json

API_BASE_URL = "https://three-pics.com/api"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"
UPLOAD_DIR = "/opt/threepics/threepics-dashboard/backend/uploads"
CONFIG = "/opt/threepics/threepics-dashboard/backend/config/credentials.json"

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

# Load credentials
if not os.path.exists(CONFIG):
    print("❌ config/credentials.json not found.")
    sys.exit(1)

with open(CONFIG, "r", encoding="utf-8") as f:
    try:
        creds = json.load(f)
    except json.JSONDecodeError as err:
        print(f"❌ Invalid JSON in credentials.json: {err}")
        sys.exit(1)

CLIENT_ID = creds.get("client_id")
CLIENT_SECRET = creds.get("client_secret")

if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ client_id or client_secret missing in credentials.json.")
    sys.exit(1)


def get_oauth2_token(client_id, client_secret):
    """
    Get access token using OAuth2 client credentials.
    """
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "read write",
    }
    response = requests.post(OAUTH2_TOKEN_URL, data=data, timeout=60)
    response.raise_for_status()
    return response.json().get("access_token")


def upload_image(filepath, token):
    """
    Upload a single image file to the API.

    Args:
        filepath (str): Path to the local file
        token (str): OAuth2 bearer token

    Returns:
        bool: True if upload was successful, False otherwise
    """
    url = f"{API_BASE_URL}/upload/image/"
    headers = {"Authorization": f"Bearer {token}"}
    filename = os.path.basename(filepath)

    try:
        with open(filepath, "rb") as file_handle:
            files = {"image": (filename, file_handle)}
            response = requests.post(url, headers=headers, files=files, timeout=60)
            response.raise_for_status()
            print(f"✅ Uploaded: {filename}")
            return True
    except Exception as upload_error:
        print(f"❌ Failed to upload {filename}: {upload_error}")
        return False


def main():
    """
    Main upload loop. Authenticates, uploads all image files in UPLOAD_DIR,
    and deletes them after successful upload.
    """
    print("🔐 Authenticating with API...")
    token = get_oauth2_token(CLIENT_ID, CLIENT_SECRET)

    files = os.listdir(UPLOAD_DIR)
    image_files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))]

    if not image_files:
        print("📂 No image files found in upload directory.")
        return

    for filename in image_files:
        filepath = os.path.join(UPLOAD_DIR, filename)
        if upload_image(filepath, token):
            try:
                os.remove(filepath)
                print(f"🗑️  Deleted: {filename}")
            except Exception as delete_error:
                print(f"⚠️  Could not delete {filename}: {delete_error}")

    print("✅ All done.")


if __name__ == "__main__":
    main()
