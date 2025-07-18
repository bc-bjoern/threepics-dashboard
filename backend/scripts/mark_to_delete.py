import sys
import os
import json
import requests

# Konfiguration
CONFIG_DIR = "config"
CREDENTIALS_FILE = os.path.join(CONFIG_DIR, "credentials.json")
API_URL = "https://three-pics.com/api/mark-to-delete/"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"

def load_credentials():
    try:
        with open(CREDENTIALS_FILE, "r", encoding="utf-8") as f:
            creds = json.load(f)
            client_id = creds.get("client_id")
            client_secret = creds.get("client_secret")
            if not client_id or not client_secret:
                raise ValueError("Fehlende client_id oder client_secret in credentials.json")
            return client_id, client_secret
    except FileNotFoundError:
        raise FileNotFoundError(f"⚠️ Datei nicht gefunden: {CREDENTIALS_FILE}")
    except json.JSONDecodeError:
        raise ValueError(f"⚠️ Ungültiges JSON in {CREDENTIALS_FILE}")

def get_access_token(client_id, client_secret):
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'read write',
    }
    response = requests.post(OAUTH2_TOKEN_URL, data=data)
    if response.status_code != 200:
        print(f"❌ Fehler beim Token-Abruf: {response.status_code} {response.text}")
        response.raise_for_status()
    token_data = response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise ValueError("Kein access_token erhalten.")
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
        print("✅ Erfolgreich markiert:", response.json())
    else:
        print("❌ Fehler beim Markieren:", response.status_code, response.text)

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("⚠️ Bitte gib einen Dateinamen als Argument an.")
        filename = sys.argv[1]

        client_id, client_secret = load_credentials()
        token = get_access_token(client_id, client_secret)
        mark_media_to_delete(token, filename)
    except Exception as e:
        print("❌ Fehler:", e)

if __name__ == "__main__":
    main()
