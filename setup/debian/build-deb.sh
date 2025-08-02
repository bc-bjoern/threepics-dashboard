#!/bin/bash
set -e


PACKAGE_NAME=threepics-dashboard
VERSION=1.0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="$SCRIPT_DIR"
OUTPUT_FILE="${PACKAGE_NAME}_${VERSION}.deb"

# fix github permissions
chmod 440 "$BUILD_ROOT/etc/sudoers.d/threepics"

# Project dir
mkdir -p "$BUILD_ROOT/opt/threepics"

# Delete old one if exiss nt lten dashboard-Dateien reingerutscht sind
rm -rf "$BUILD_ROOT/opt/threepics/$PACKAGE_NAME"

# Paket bauen
dpkg-deb --build "$BUILD_ROOT" "$SCRIPT_DIR/../$OUTPUT_FILE"

echo "✅ Paket erstellt: $OUTPUT_FILE"
