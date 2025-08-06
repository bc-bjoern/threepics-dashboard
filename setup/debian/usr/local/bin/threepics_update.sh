#!/bin/bash
set -euo pipefail

# === KONFIGURATION ===
PACKAGE="threepics-dashboard"
LAST_TAG_FILE="/var/tmp/THREEPICS_VERSION"
MARKER_FILE="/opt/threepics/threepics-dashboard/.deb_update_available"
LOGFILE="/var/log/threepics-autoupdate.log"

# === LOG-FUNKTION ===
log() {
  echo "[$(date +'%F %T')] $*" >> "$LOGFILE"
}

log "🔍 Starte Updateprüfung über apt..."

# === AKTUELLE INSTALLIERTE VERSION ===
CURRENT_VERSION=$(dpkg-query -W -f='${Version}' "$PACKAGE" 2>/dev/null || echo "none")
log "📄 Installierte Version: $CURRENT_VERSION"

# === VERFÜGBARE VERSION ===
AVAILABLE_VERSION=$(apt-cache policy "$PACKAGE" | awk '/Candidate:/ { print $2 }')
log "📦 Verfügbare Version: $AVAILABLE_VERSION"

# === VERGLEICH ===
if [[ "$CURRENT_VERSION" != "$AVAILABLE_VERSION" && "$AVAILABLE_VERSION" != "(none)" ]]; then
  log "⬆️ Update verfügbar: $CURRENT_VERSION → $AVAILABLE_VERSION"

  apt-get update
  apt-get install -y "$PACKAGE"
  log "✅ Update installiert."

  echo "$AVAILABLE_VERSION" > "$LAST_TAG_FILE"
  echo "$AVAILABLE_VERSION" > "$MARKER_FILE"
  log "📌 Marker-Dateien aktualisiert."

else
  log "⏳ Kein Update erforderlich."
fi
