#!/usr/bin/env python3
"""
threepics_usbcopy.py

This script is intended to be triggered automatically when a USB stick is inserted
(e.g., via udev and systemd-run) on a Raspberry Pi system. It mounts the inserted
device, searches for image files (JPG, JPEG, PNG) in all directories (including subfolders),
and copies them into a specified uploads directory. The copied files are flattened
(no folder structure is preserved) and filename collisions are resolved by appending
a numeric suffix (e.g., image.jpg → image_1.jpg).

Key Features:
- Supports mounting of standard Linux filesystems and NTFS (via ntfs-3g).
- Recursively finds image files with case-insensitive extensions.
- Ensures no copied image overwrites existing ones.
- Uses systemd journal for logging via standard output.
- Unmounts the device cleanly after the operation.

Expected usage:
    sudo systemd-run --unit=threepics-usbcopy-sdX \
        /usr/bin/python3 /usr/local/bin/threepics_usbcopy.py sdX

Example:
    /dev/sda1 will be mounted and all .jpg/.jpeg/.png files (regardless of case)
    will be copied to /opt/threepics/threepics-dashboard/backend/uploads.

Author: Björn Becker
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path


def mount_device(device: str, mountpoint: str) -> bool:
    """
    Attempt to mount the given device to the specified mountpoint.
    Supports standard Linux filesystems and NTFS.
    Returns True if mounting was successful, False otherwise.
    """
    os.makedirs(mountpoint, exist_ok=True)

    try:
        subprocess.run(["mount", device, mountpoint], check=True)
        print(f"[MOUNT] Mounted {device} using default method")
        return True
    except subprocess.CalledProcessError:
        try:
            subprocess.run(["mount", "-t", "vfat", device, mountpoint], check=True)
            print(f"[MOUNT] Mounted {device} as vfat")
            return True
        except subprocess.CalledProcessError:
            try:
                subprocess.run(["mount", "-t", "ntfs-3g", device, mountpoint], check=True)
                print(f"[MOUNT] Mounted {device} as NTFS")
                return True
            except subprocess.CalledProcessError as mount_error:
                print(f"[ERROR] Mount failed: {mount_error}")
                return False


def unmount_device(mountpoint: str):
    """
    Unmounts the given mountpoint.
    Logs any failure to unmount.
    """
    try:
        subprocess.run(["umount", mountpoint], check=True)
        print(f"[UNMOUNT] Unmounted {mountpoint}")
    except subprocess.CalledProcessError as unmount_error:
        print(f"[ERROR] Unmount failed: {unmount_error}")


def get_unique_filename(dest_dir: Path, filename: str) -> Path:
    """
    Checks if a file with the given name exists in the destination directory.
    If it exists, appends a counter (_1, _2, ...) to create a unique filename.
    """
    base, ext = os.path.splitext(filename)
    candidate = dest_dir / filename
    counter = 1
    while candidate.exists():
        candidate = dest_dir / f"{base}_{counter}{ext}"
        counter += 1
    return candidate


def copy_images(src_dir: Path, dest_dir: Path):
    """
    Recursively scans the source directory for image files (jpg, jpeg, png),
    ignoring case, and copies them to the destination directory without preserving
    subdirectories. Files with conflicting names are renamed to avoid overwrites.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    supported_exts = {'.jpg', '.jpeg', '.png'}

    count = 0
    for path in src_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in supported_exts:
            target_path = get_unique_filename(dest_dir, path.name)
            try:
                shutil.copy2(path, target_path)
                print(f"[COPY] {path} → {target_path}")
                count += 1
            except OSError as copy_error:
                print(f"[ERROR] Failed to copy {path}: {copy_error}")

    print(f"[SUMMARY] Total images copied: {count}")


def main():
    """
    Main entry point. Expects one argument: the device name (e.g., sda1).
    Mounts the device, copies image files, and unmounts afterward.
    """
    if len(sys.argv) < 2:
        print("Device argument missing. Usage: usbcopy.py <device>")
        sys.exit(1)

    device = f"/dev/{sys.argv[1]}"
    mountpoint = "/mnt/usbcopy"
    target_dir = "/opt/threepics/threepics-dashboard/backend/uploads"

    print(f"[START] Copying from {device}")

    if mount_device(device, mountpoint):
        copy_images(Path(mountpoint), Path(target_dir))
        unmount_device(mountpoint)
    else:
        print(f"[ABORT] Could not mount {device}")


if __name__ == "__main__":
    main()
