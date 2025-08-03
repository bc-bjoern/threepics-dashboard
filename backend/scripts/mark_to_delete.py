#!/usr/bin/env python3
"""
mark_to_delete.py

This script authenticates with the 'three-pics.com' API using OAuth2 client credentials
and marks a specified media file (by filename) for deletion.

Features:
- Reads credentials from config/credentials.json
- Authenticates using the OAuth2 client credentials flow
- Sends a POST request to mark the media for deletion
- Provides clear CLI error messages

Usage:
    python mark_to_delete.py <filename>

Requirements:
- Python 3.x
- requests library

Example:
    python mark_to_delete.py my_image.jpg
"""

import sys
import os
import json
import requests

# Configuration
CONFIG_DIR = "config"
CREDENTIALS_FILE = os.path.join(CONFIG_DIR, "credentials.json")
API_URL = "https://three-pics.com/api/mark-to-delete/"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"


def load_credentials():
    """
    Load client credentials from config/credentials.json.

    Returns:
        tuple: (client_id, client_secret)

    Raises:
        FileNotFoundError: If the credentials file is missing.
        ValueError: If required fields are missing or file is invalid.
    """
    try:
        with open(CREDENTIALS_FILE, "r", encoding="utf-8") as f:
            creds = json.load(f)
            client_id = creds.get("client_id")
            client_secret = creds.get("client_secret")
            if not client_id or not client_secret:
                raise ValueError("Missing 'client_id' or 'client_secret' in credentials.json")
            return client_id, client_secret
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"⚠️ File not found: {CREDENTIALS_FILE}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"⚠️ Invalid JSON format in {CREDENTIALS_FILE}") from exc


def get_access_token(client_id, client_secret):
    """
    Obtain an access token via OAuth2 client credentials flow.

    Args:
        client_id (str): OAuth2 client ID.
        client_secret (str): OAuth2 client secret.

    Returns:
        str: Bearer access token.

    Raises:
        ValueError: If no token is received or request fails.
        requests.exceptions.RequestException: For any request-related failure.
    """
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'read write',
    }
    response = requests.post(OAUTH2_TOKEN_URL, data=data)

    if response.status_code != 200:
        print(f"❌ Failed to retrieve token: {response.status_code} {response.text}")
        response.raise_for_status()

    token_data = response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        raise ValueError("No access_token received from the OAuth2 response.")

    return access_token


def mark_media_to_delete(access_token, filename):
    """
    Send a request to the API to mark a file for deletion by filename.

    Args:
        access_token (str): Bearer token for authentication.
        filename (str): Name of the media file to be marked.

    Raises:
        requests.exceptions.RequestException: If the API call fails.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip"
    }
    data = {
        "filename": filename,
    }

    response = requests.post(API_URL, json=data, headers=headers)

    if response.status_code == 200:
        print(f"✅ File successfully marked for deletion: {response.json()}")
    else:
        print(f"❌ Failed to mark file: {response.status_code} {response.text}")


def main():
    """
    Main entry point: validates arguments, loads credentials, authenticates,
    and marks the provided filename for deletion.
    """
    try:
        if len(sys.argv) < 2:
            raise ValueError("⚠️ Please provide a filename as an argument.")

        filename = sys.argv[1]

        client_id, client_secret = load_credentials()
        token = get_access_token(client_id, client_secret)
        mark_media_to_delete(token, filename)

    except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
        print(f"❌ Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")


if __name__ == "__main__":
    main()
