#!/usr/bin/env python3
import os
import json

API_BASE_URL = "https://three-pics.com/api"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"
CONFIG_DIR = "config"
DEVICE_FILE = os.path.join(CONFIG_DIR, "device.json")
CREDENTIALS_FILE = os.path.join(CONFIG_DIR, "credentials.json")

try:
    import requests
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


def load_credentials():
    if not os.path.exists(CREDENTIALS_FILE):
        raise FileNotFoundError(f"❌ Datei nicht gefunden: {CREDENTIALS_FILE}")
    with open(CREDENTIALS_FILE, "r", encoding="utf-8") as f:
        creds = json.load(f)
    return creds["client_id"], creds["client_secret"]


def get_oauth2_token(client_id, client_secret):
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
    if not os.path.exists(DEVICE_FILE):
        raise FileNotFoundError(f"❌ Datei nicht gefunden: {DEVICE_FILE}")
    with open(DEVICE_FILE, "r", encoding="utf-8") as f:
        device_data = json.load(f)

    required_fields = ["device_id", "hostname"]
    if not all(field in device_data for field in required_fields):
        raise ValueError(f"❌ Fehlende Felder in device.json. Erwartet: {required_fields}")

    return device_data


def register_device(token, device_data):
    url = f"{API_BASE_URL}/device/register"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=device_data)
    response.raise_for_status()
    print(f"✅ Gerät erfolgreich registriert: {response.status_code}")


def main():
    try:
        client_id, client_secret = load_credentials()
        token = get_oauth2_token(client_id, client_secret)
        device_data = load_device_data()
        register_device(token, device_data)
    except Exception as e:
        print(f"❌ Fehler: {e}")


if __name__ == "__main__":
    main()
