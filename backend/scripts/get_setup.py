#!/usr/bin/env python3
"""
get_setup.py

Script to fetch the authenticated user's Setup configuration from the API
and save it locally as JSON in backend/config/setup.json.

Requires:
- config/credentials.json with OAuth2 client_id and client_secret.
- API provides /api/setup/ endpoint (OAuth2-protected).

Usage:
    python get_setup.py
"""

import os
import json

API_BASE_URL = "https://three-pics.com/api"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"
CONFIG_DIR = "config"
OUTPUT_FILE = os.path.join(CONFIG_DIR, "setup.json")

try:
    import requests
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


def load_credentials():
    creds_path = os.path.join(CONFIG_DIR, "credentials.json")
    with open(creds_path, "r", encoding="utf-8") as f:
        creds = json.load(f)
    return creds["client_id"], creds["client_secret"]


def get_oauth2_token(client_id, client_secret):
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'read',
    }
    response = requests.post(OAUTH2_TOKEN_URL, data=data)
    response.raise_for_status()
    return response.json().get('access_token')


def fetch_setup_data(token):
    url = f"{API_BASE_URL}/setup/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def save_setup_to_file(setup_data):
    os.makedirs(CONFIG_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(setup_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Setup gespeichert unter: {OUTPUT_FILE}")


def main():
    client_id, client_secret = load_credentials()
    token = get_oauth2_token(client_id, client_secret)
    setup = fetch_setup_data(token)
    save_setup_to_file(setup)


if __name__ == "__main__":
    main()

