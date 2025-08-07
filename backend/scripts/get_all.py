#!/usr/bin/env python3
"""
get_all.py

A command-line script to authenticate with a local API using OAuth2 client credentials,
retrieve a list of media items, and download them into organized local directories
based on media type. Supports automated installation of missing dependencies
(`requests`), structured downloads, and cleanup of outdated files.

Features:
- Reads OAuth2 client credentials from config/credentials.json.
- Automatically installs the 'requests' package if not available.
- Obtains an access token via the client credentials grant flow.
- Fetches media metadata (images, videos, texts) from the API.
- Downloads media files into categorized directories under 'downloads/':
    - images/   → .jpg files
    - videos/   → .mp4 files
    - texts/    → .txt files with metadata for images/videos
    - messages/ → .txt files for standalone text content
- Saves accompanying text content as .txt files when available.
- Cleans up previously downloaded files that are no longer part of the current media list.

Directory structure:
downloads/
├── images/
├── videos/
├── texts/
└── messages/

Usage:
    python get_all.py

Requirements:
- Python 3.x
- requests library (auto-installed if not present)
- OAuth2 credentials in config/credentials.json

Example credentials.json:
{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
}

Exit Codes:
- 0: Success
- 1: Credential errors, JSON parsing issues, or download failures
"""

import sys
import os
import json
import tempfile
import shutil

API_BASE_URL = "https://three-pics.com/api"
OAUTH2_TOKEN_URL = "https://three-pics.com/o/token/"
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "../downloads")

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


credentials_path = os.path.join("config", "credentials.json")

if not os.path.exists(credentials_path):
    print("❌ config/credentials.json not found. Please provide credentials.")
    sys.exit(1)

with open(credentials_path, "r", encoding="utf-8") as credsfile:
    try:
        creds = json.load(credsfile)
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error in credentials.json: {e}")
        sys.exit(1)

CLIENT_ID = creds.get("client_id")
CLIENT_SECRET = creds.get("client_secret")

if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ Missing 'client_id' or 'client_secret' in credentials.json.")
    sys.exit(1)


def get_oauth2_token(client_id, client_secret):
    """
    Retrieve an OAuth2 access token using client credentials.

    Args:
        client_id (str): The client ID from the credentials file.
        client_secret (str): The client secret from the credentials file.

    Returns:
        str: The access token as a string.
    
    Raises:
        requests.exceptions.HTTPError: If the request to obtain the token fails.
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


def prepare_directories(base_dir):
    """
    Create all required subdirectories under the download directory.

    Args:
        base_dir (str): The root directory to create subfolders in.

    Returns:
        dict: A dictionary with empty sets for each media category.
    """
    subdirs = ["images", "videos", "texts", "messages"]
    for subdir in subdirs:
        os.makedirs(os.path.join(base_dir, subdir), exist_ok=True)

    return {subdir: set() for subdir in subdirs}


def process_media_item(item, token, expected_files):
    """
    Process and download a single media item and its associated text (if any).

    Args:
        item (dict): A media item returned by the API.
        token (str): Access token for authenticated API calls.
        expected_files (dict): Tracks downloaded filenames per media type.
    """
    mtype = item.get("type")
    uid = item.get("id")
    original_filename = item.get("filename")

    if mtype in ("image", "video"):
        file_url = f"{API_BASE_URL}/download/{mtype}/{uid}/"
        subdir = "images" if mtype == "image" else "videos"
        filepath = os.path.join(DOWNLOAD_DIR, subdir, original_filename)

        if not os.path.exists(filepath):
            download_file(token, file_url, filepath)
            print(f"⬇️  Load: {filepath}")

        expected_files[subdir].add(original_filename)

        # Optional text metadata
        text1 = item.get("text1", "")
        if text1:
            text_filename = os.path.splitext(original_filename)[0] + ".txt"
            text_path = os.path.join(DOWNLOAD_DIR, "texts", text_filename)
            if not os.path.exists(text_path):
                save_text_item(text1.strip(), text_path)
            expected_files["texts"].add(text_filename)

    elif mtype == "text":
        # Text aus API-Daten direkt speichern (statt Download-Endpunkt zu nutzen)
        text_filename = f"text_{uid}.txt"
        text_path = os.path.join(DOWNLOAD_DIR, "messages", text_filename)

        telegram_meta = {
            "telegram_user_id": item.get("telegram_user_id"),
            "telegram_username": item.get("telegram_username"),
            "telegram_first_name": item.get("telegram_first_name"),
            "telegram_last_name": item.get("telegram_last_name"),
        }

        text_content = item.get("text", "").strip()
        save_text_item(text_content, text_path, telegram_meta)

        expected_files["messages"].add(text_filename)



def cleanup_files(expected_files):
    """
    Remove any previously downloaded files that are no longer listed in the media API.

    Args:
        expected_files (dict): Dictionary of expected filenames per category.
    """
    for category, filenames in expected_files.items():
        if category == "messages":
            continue

        dir_path = os.path.join(DOWNLOAD_DIR, category)
        for fname in os.listdir(dir_path):
            if fname not in filenames:
                fpath = os.path.join(dir_path, fname)
                try:
                    os.remove(fpath)
                    print(f"🗑️  Deleted outdated file: {fpath}")
                except (OSError, PermissionError) as e:
                    print(f"⚠️  Failed to delete {fpath}: {e}")


def list_media(access_token):
    """
    Fetch the list of available media items from the API.

    Args:
        access_token (str): Bearer token for authenticated API access.

    Returns:
        list: A list of media item dictionaries retrieved from the API.

    Raises:
        requests.exceptions.HTTPError: If the request fails.
    """
    url = f"{API_BASE_URL}/media-list/"
    headers = {"Authorization": f"Bearer {access_token}", "Accept-Encoding": "gzip"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def download_file(access_token, url, save_path):
    """
    Download a file from the specified URL and save it to the given path.

    Args:
        access_token (str): Bearer token for authenticated API access.
        url (str): The URL of the file to download.
        save_path (str): Local filesystem path to save the file to.

    Raises:
        requests.exceptions.HTTPError: If the file download fails.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers, stream=True)
    response.raise_for_status()

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_path = tmp_file.name
        total_bytes = 0
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:  # Skip keep-alive chunks
                tmp_file.write(chunk)
                total_bytes += len(chunk)

    if total_bytes == 0:
        print(f"⚠️  Datei hat 0 Bytes, wird verworfen: {url}")
        os.remove(tmp_path)
    else:
        shutil.move(tmp_path, save_path)
        print(f"✅ Heruntergeladen: {save_path}")


def save_text_item(text, save_path, telegram_meta=None):
    """
    Save the provided text content and optional telegram metadata to a .txt file.

    Args:
        text (str): The text content to save.
        save_path (str): Local filesystem path where the text will be saved.
        telegram_meta (dict): Optional dictionary with telegram sender information.
    """
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    meta_lines = []
    if telegram_meta:
        meta_lines.append(f"[Telegram User ID] {telegram_meta.get('telegram_user_id', '')}")
        meta_lines.append(f"[Username] @{telegram_meta.get('telegram_username', '')}")
        first = telegram_meta.get("telegram_first_name", "") or ""
        last = telegram_meta.get("telegram_last_name", "") or ""
        full_name = f"{first} {last}".strip()
        meta_lines.append(f"[Name] {full_name}")

    content = "\n".join(meta_lines + ["", "[Text]", text.strip()])

    with open(save_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"📝 Gespeichert: {save_path}")


def main():
    """
    Main execution logic:
    - Authenticate and obtain an access token.
    - Retrieve the list of media items.
    - Download each media item (image, video, text).
    - Save associated text metadata.
    - Clean up old files not listed in the latest media response.
    """
    token = get_oauth2_token(CLIENT_ID, CLIENT_SECRET)
    media_items = list_media(token)

    expected_files = prepare_directories(DOWNLOAD_DIR)

    for item in media_items:
        process_media_item(item, token, expected_files)

    cleanup_files(expected_files)

if __name__ == "__main__":
    main()
