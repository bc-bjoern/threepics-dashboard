#!/bin/bash
set -euo pipefail

# === KONFIGURATION ===
REPO="bc-bjoern/threepics-dashboard"
PACKAGE="threepics-dashboard"
ARCH="arm64"
DEST_DIR="/opt/threepics/threepics-dashboard"
LAST_TAG_FILE="$DEST_DIR/.VERSION"
DEB_PATH="$DEST_DIR/latest_downloaded.deb"
MARKER_FILE="$DEST_DIR/.deb_update_available"
LOGFILE="/var/log/threepics-autoupdate.log"

# === LOG-FUNKTION ===
log() {
  echo "[$(date +'%F %T')] $*" >> "$LOGFILE"
}

log "🔍 Starte Updateprüfung..."

# === LETZTES RELEASE LADEN VON GITHUB ===
LATEST_TAG=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | jq -r '.tag_name')
log "👉 Gefundenes GitHub-Tag: $LATEST_TAG"

# === AKTUELL INSTALLIERTE VERSION LESEN ===
if [ -f "$LAST_TAG_FILE" ]; then
  CURRENT_TAG=$(cat "$LAST_TAG_FILE")
else
  CURRENT_TAG=""
fi
log "📄 Aktuell bekannte Version: $CURRENT_TAG"

# === VERGLEICH ===
if [[ "$LATEST_TAG" != "$CURRENT_TAG" && -n "$LATEST_TAG" ]]; then
  log "⬇️ Neues Release erkannt: $LATEST_TAG → Download wird vorbereitet"

  DEB_FILENAME="${PACKAGE}_${LATEST_TAG}.deb"
  DOWNLOAD_URL="https://github.com/$REPO/releases/download/$LATEST_TAG/$DEB_FILENAME"

  curl -L -o "$DEB_PATH" "$DOWNLOAD_URL"
  log "✅ .deb-Datei heruntergeladen nach $DEB_PATH"

  echo "$LATEST_TAG" > "$MARKER_FILE"
  log "📌 Marker-Datei geschrieben: $MARKER_FILE"

else
  log "⏳ Kein neues Release verfügbar."
fi
