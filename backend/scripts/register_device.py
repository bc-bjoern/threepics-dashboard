#!/usr/bin/env python3
"""
register_device.py

This script authenticates with the 'three-pics.com' API using OAuth2 client credentials,
reads device information from a local JSON file, and registers the device via the API.

Features:
- Reads client credentials from config/credentials.json
- Loads device information from config/device.json
- Authenticates using OAuth2 client credentials
- Registers the device using the /device/register endpoint

Usage:
    python register_device.py

Requirements:
- Python 3.x
- requests (auto-installed if missing)

Example device.json:
{
    "device_id": "abc123",
    "hostname": "my-device"
}
"""

import os
import json

API_BASE_URL = "https://three-pics.com/api"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"
CONFIG_DIR = "config"
DEVICE_FILE = os.path.join(CONFIG_DIR, "device.json")
CREDENTIALS_FILE = os.path.join(CONFIG_DIR, "credentials.json")

# Ensure 'requests' is installed
try:
    import requests
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


def load_credentials():
    """
    Load OAuth2 client credentials from config/credentials.json.

    Returns:
        tuple: (client_id, client_secret)

    Raises:
        FileNotFoundError: If the credentials file is missing.
        KeyError: If required keys are missing in the file.
    """
    if not os.path.exists(CREDENTIALS_FILE):
        raise FileNotFoundError(f"❌ File not found: {CREDENTIALS_FILE}")

    with open(CREDENTIALS_FILE, "r", encoding="utf-8") as f:
        creds = json.load(f)

    return creds["client_id"], creds["client_secret"]


def get_oauth2_token(client_id, client_secret):
    """
    Request an OAuth2 access token using the client credentials flow.

    Args:
        client_id (str): OAuth2 client ID.
        client_secret (str): OAuth2 client secret.

    Returns:
        str: Access token.

    Raises:
        requests.exceptions.HTTPError: If the token request fails.
    """
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'read write',
    }
    response = requests.post(OAUTH2_TOKEN_URL, data=data)
    response.raise_for_status()
    return response.json().get('access_token')


def load_device_data():
    """
    Load device information from config/device.json and validate required fields.

    Returns:
        dict: Device data containing 'device_id' and 'hostname'.

    Raises:
        FileNotFoundError: If the device file is missing.
        ValueError: If required fields are missing in the JSON data.
    """
    if not os.path.exists(DEVICE_FILE):
        raise FileNotFoundError(f"❌ File not found: {DEVICE_FILE}")

    with open(DEVICE_FILE, "r", encoding="utf-8") as f:
        device_data = json.load(f)

    required_fields = ["device_id", "hostname"]
    if not all(field in device_data for field in required_fields):
        raise ValueError(f"❌ Missing fields in device.json. Required: {required_fields}")

    return device_data


def register_device(token, device_data):
    """
    Register the device by sending a POST request to the API.

    Args:
        token (str): Bearer access token.
        device_data (dict): Device data including 'device_id' and 'hostname'.

    Raises:
        requests.exceptions.HTTPError: If the registration request fails.
    """
    url = f"{API_BASE_URL}/device/register"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=device_data)
    response.raise_for_status()
    print(f"✅ Device successfully registered. Status code: {response.status_code}")


def main():
    """
    Main function: handles loading credentials and device data, authenticating,
    and registering the device.
    """
    try:
        client_id, client_secret = load_credentials()
        token = get_oauth2_token(client_id, client_secret)
        device_data = load_device_data()
        register_device(token, device_data)
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")

    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON format: {e}")

    except KeyError as e:
        print(f"❌ Missing expected key in JSON: {e}")

    except ValueError as e:
        print(f"❌ Data validation error: {e}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Network or API error: {e}")


if __name__ == "__main__":
    main()
