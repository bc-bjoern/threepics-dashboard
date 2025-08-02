#!/usr/bin/env python3
"""
get_setup.py

This script authenticates with the 'three-pics.com' API using OAuth2 client credentials,
retrieves setup configuration data, and stores it locally as `config/setup.json`.

Features:
- Reads client credentials from `config/credentials.json`
- Automatically installs the `requests` package if not installed
- Authenticates via OAuth2 and retrieves a bearer token
- Fetches setup data from the API
- Writes data to disk only if the content has changed

Usage:
    python fetch_setup.py

Requirements:
- Python 3.x
- requests (auto-installed if not present)

Example credentials.json:
{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
}
"""

import os
import json

API_BASE_URL = "https://three-pics.com/api"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"
CONFIG_DIR = "config"
OUTPUT_FILE = os.path.join(CONFIG_DIR, "setup.json")

# Ensure requests is available
try:
    import requests
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


def load_credentials():
    """
    Load client_id and client_secret from the credentials file.

    Returns:
        tuple: A tuple containing (client_id, client_secret)

    Raises:
        FileNotFoundError: If the credentials file does not exist.
        KeyError: If required keys are missing.
        json.JSONDecodeError: If the file is not valid JSON.
    """
    creds_path = os.path.join(CONFIG_DIR, "credentials.json")
    with open(creds_path, "r", encoding="utf-8") as f:
        creds = json.load(f)
    return creds["client_id"], creds["client_secret"]


def get_oauth2_token(client_id, client_secret):
    """
    Request an OAuth2 access token using client credentials.

    Args:
        client_id (str): The client ID.
        client_secret (str): The client secret.

    Returns:
        str: The access token.

    Raises:
        requests.exceptions.HTTPError: If the token request fails.
    """
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
    """
    Fetch setup data from the API using the provided token.

    Args:
        token (str): The OAuth2 bearer token.

    Returns:
        dict: Parsed JSON response from the API.

    Raises:
        requests.exceptions.HTTPError: If the request fails.
    """
    url = f"{API_BASE_URL}/setup/"
    headers = {"Authorization": f"Bearer {token}", "Accept-Encoding": "gzip"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def save_setup_to_file(setup_data):
    """
    Save setup data to disk only if it differs from the existing content.

    Args:
        setup_data (dict): The setup data to save.
    """
    os.makedirs(CONFIG_DIR, exist_ok=True)

    # Check if existing file is identical
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            try:
                existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = None

        if existing_data == setup_data:
            print("ℹ️  Setup is unchanged. Nothing to update.")
            return

    # Write new setup data
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(setup_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Setup data has been updated and saved to: {OUTPUT_FILE}")


def main():
    """
    Main entry point: authenticate, fetch setup data, and store it if changed.
    """
    client_id, client_secret = load_credentials()
    token = get_oauth2_token(client_id, client_secret)
    setup = fetch_setup_data(token)
    save_setup_to_file(setup)


if __name__ == "__main__":
    main()
