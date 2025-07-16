#!/usr/bin/env python3
"""
get_all.py

Script to authenticate with a local API using OAuth2 client credentials,
fetch a list of media items (images, videos, texts), and download them
to local folders organized by media type.

Features:
- Reads client credentials from config/credentials.json.
- Obtains OAuth2 access token.
- Retrieves media list via API.
- Downloads images and videos to separate directories under 'downloads/'.
- Saves associated text metadata for images/videos if available.
- Downloads standalone text items to a dedicated folder.
- Handles token authentication and error checking for HTTP requests.

Directory structure created under 'downloads/':
- images/   : downloaded image files (.jpg)
- videos/   : downloaded video files (.mp4)
- texts/    : text metadata associated with images/videos (.txt)
- messages/ : standalone text messages (.txt)

Usage:
    python get_all.py

Requirements:
- Python 3.x
- requests library (auto-installed if missing)
- Valid OAuth2 client_id and client_secret in config/credentials.json

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
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "../downloads")

try:
    import requests
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


credentials_path = os.path.join("config", "credentials.json")

if not os.path.exists(credentials_path):
    print(f"❌ config/credentials.json not found. Please provide credentials.")
    exit(1)

with open(credentials_path, "r", encoding="utf-8") as credsfile:
    try:
        creds = json.load(credsfile)
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error in credentials.json: {e}")
        exit(1)

CLIENT_ID = creds.get("client_id")
CLIENT_SECRET = creds.get("client_secret")

if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ Missing 'client_id' or 'client_secret' in credentials.json.")
    exit(1)


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


def list_media(access_token):
    url = f"{API_BASE_URL}/media-list/"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def download_file(access_token, url, save_path):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers, stream=True)
    response.raise_for_status()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "wb") as file_handle:
        for chunk in response.iter_content(chunk_size=8192):
            file_handle.write(chunk)
    print(f"✅ Heruntergeladen: {save_path}")


def save_text_item(text, save_path):
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    content = f"[Text]\n{text}"
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"📝 Gespeichert: {save_path}")


def main():
    token = get_oauth2_token(CLIENT_ID, CLIENT_SECRET)
    media_items = list_media(token)

    for subdir in ["images", "videos", "texts", "messages"]:
        os.makedirs(os.path.join(DOWNLOAD_DIR, subdir), exist_ok=True)

    expected_files = {
        "images": set(),
        "videos": set(),
        "texts": set(),
        "messages": set()
    }

    for item in media_items:
        mtype = item.get("type")
        uid = item.get("id")
        original_filename = item.get("filename")
        created_at = item.get("created_at") or item.get("uploaded_at")

        if mtype in ("image", "video"):
            file_url = f"{API_BASE_URL}/download/{mtype}/{uid}/"
            ext = "jpg" if mtype == "image" else "mp4"
            save_subdir = "images" if mtype == "image" else "videos"
            filename = original_filename
            file_path = os.path.join(DOWNLOAD_DIR, save_subdir, filename)

            if not os.path.exists(file_path):
              download_file(token, file_url, file_path)
              print(f"⬇️  Neu geladen: {file_path}")

            expected_files[save_subdir].add(filename)

            text1 = item.get("text1", "")
            if text1:
                text_combined = f"{text1}".strip()
                text_filename = os.path.splitext(original_filename)[0] + ".txt"
                text_path = os.path.join(DOWNLOAD_DIR, "texts", text_filename)
                if not os.path.exists(text_path):
                  save_text_item(text_combined, text_path)

                expected_files["texts"].add(text_filename)

        elif mtype == "text":
            file_url = f"{API_BASE_URL}/download/text/{uid}/"
            text_filename = f"text_{uid}.txt"
            text_path = os.path.join(DOWNLOAD_DIR, "messages", text_filename)
            download_file(token, file_url, text_path)
            expected_files["messages"].add(text_filename)

    # 🧹 Aufräumen: nicht mehr vorhandene Dateien löschen
    for category in expected_files:
        dir_path = os.path.join(DOWNLOAD_DIR, category)
        for fname in os.listdir(dir_path):
            if fname not in expected_files[category]:
                fpath = os.path.join(dir_path, fname)
                try:
                    os.remove(fpath)
                    print(f"🗑️  Gelöscht (nicht mehr benötigt): {fpath}")
                except Exception as e:
                    print(f"⚠️  Fehler beim Löschen von {fpath}: {e}")


if __name__ == "__main__":
    main()
