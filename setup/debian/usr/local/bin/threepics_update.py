#!/usr/bin/env python3
"""
Auto-Update Script for Debian Package 'threepics-dashboard'

This script is designed to automatically check for and install updates of the
'threepics-dashboard' Debian package using the system's APT infrastructure.

Features:
- Reads user configuration from a JSON file to determine if auto-updates are enabled.
- Compares the currently installed version with the candidate version from APT.
- If auto-updates are enabled and a newer version is available, installs it via apt-get.
- If auto-updates are disabled but a new version is found, creates a marker file to
  indicate that a manual update is available.
- If no new version is available, removes the marker file if it exists.
- All actions are logged using Python's built-in logging module.

Configuration paths and filenames are defined at the top of the script and can be
customized as needed.

Expected JSON format (setup.json):
{
  "auto_update_enabled": true,
  ...
}

This script is intended to be run periodically (e.g., via cron or systemd timer)
and assumes it is executed with sufficient privileges to perform APT operations.

Author: Björn Becker
Date: 2025-08-06
"""

import subprocess
import json
import logging
from pathlib import Path

# === CONFIGURATION ===
PACKAGE = "threepics-dashboard"
SETUP_JSON = "/opt/threepics/threepics-dashboard/backend/config/setup.json"
MARKER_FILE = "/opt/threepics/threepics-dashboard/.deb_update_available"
LOGFILE = "/opt/threepics/threepics-dashboard/threepics-autoupdate.log"

# === LOGGING CONFIGURATION ===
logging.basicConfig(
    filename=LOGFILE,
    filemode="a",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


def run(command):
    """
    Execute a shell command and return its standard output.

    Args:
        command (str): The command to run.

    Returns:
        str: The trimmed standard output from the command.
    """
    try:
        result = subprocess.run(
            command, shell=True, check=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        logger.error("Command failed: %s", command)
        logger.error("Error output: %s", e.stderr.strip())
        return ""


def read_json(filepath):
    """
    Load a JSON file and return its contents as a dictionary.

    Args:
        filepath (str): Path to the JSON file.

    Returns:
        dict: Parsed JSON data or an empty dict on error.
    """
    try:
        with open(filepath, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Error reading %s: %s", filepath, e)
        return {}


def get_installed_version():
    """
    Get the currently installed version of the package.

    Returns:
        str: The installed version or "none" if not installed.
    """
    return run(f"dpkg-query -W -f='${{Version}}' {PACKAGE}") or "none"


def get_available_version():
    """
    Get the candidate version available via apt.

    Returns:
        str: The available version or an empty string if not found.
    """
    apt_policy = run(f"apt-cache policy {PACKAGE}")
    for line in apt_policy.splitlines():
        if "Candidate:" in line:
            return line.split(":")[1].strip()
    return ""


def main():
    """
    Main update logic:
    - Checks if auto update is enabled in setup.json.
    - Compares current and available versions.
    - Installs update if enabled.
    - Otherwise writes a marker file.
    - Cleans up marker if already up to date.
    """
    setup = read_json(SETUP_JSON)
    auto_update = setup.get("auto_update_enabled", True)

    current_version = get_installed_version()
    available_version = get_available_version()

    if not available_version or available_version in ("(none)", ""):
        logger.warning("No valid available version found – aborting.")
        return

    if current_version == available_version:
        if Path(MARKER_FILE).exists():
            Path(MARKER_FILE).unlink()
            logger.info("Removed stale update marker file.")
        return

    if auto_update:
        logger.info("Auto update is enabled – proceeding with upgrade.")
        run("apt-get update")
        run(f"apt-get install -y {PACKAGE}")
        Path(MARKER_FILE).unlink(missing_ok=True)
        logger.info("✅ Update completed and marker removed.")
    else:
        logger.info("Auto update is disabled – writing marker only.")
        Path(MARKER_FILE).write_text(available_version + "\n")


if __name__ == "__main__":
    main()
