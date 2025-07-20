#!/bin/bash
set -euo pipefail

# === CONFIGURATION ===
REPO_DIR="/opt/threepics/threepics-dashboard"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"
LAST_TAG_FILE="$REPO_DIR/.VERSION"
SERVICE_FRONTEND="threepics-frontend.service"
SERVICE_BACKEND="threepics-backend.service"
LOGFILE="/var/log/threepics-autoupdate.log"

# === LOGGING FUNCTION ===
log() {
  echo "[$(date +'%F %T')] $*" >> "$LOGFILE"
}

# === STEP 1: Pull latest tags ===
cd "$REPO_DIR"
git fetch --tags

# Get the most recent tag by creation date
LATEST_TAG=$(git tag --sort=-creatordate | head -n1)

# Read last deployed tag
if [ -f "$LAST_TAG_FILE" ]; then
  KNOWN_TAG=$(cat "$LAST_TAG_FILE")
else
  KNOWN_TAG=""
fi

# === STEP 2: Compare tags ===
if [[ "$LATEST_TAG" != "$KNOWN_TAG" && -n "$LATEST_TAG" ]]; then
  log "🔁 New tag detected: $LATEST_TAG (previous: $KNOWN_TAG)"

  # === STEP 3: Checkout the new tag ===
  git reset --hard
  #git clean -fdx
  git checkout -f "$LATEST_TAG"
  log "✅ Checked out tag $LATEST_TAG"

  # === STEP 4: Build frontend ===
  cd "$FRONTEND_DIR"
  pnpm install >> "$LOGFILE" 2>&1
  pnpm build >> "$LOGFILE" 2>&1
  log "✅ Frontend build complete"

  # === STEP 5: Setup Node.js backend ===
  cd "$BACKEND_DIR"
  pnpm install >> "$LOGFILE" 2>&1
  log "✅ Backend dependencies installed (Node.js)"

  # === STEP 5.5: Python Requirements ===
  cd "$BACKEND_DIR"
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip >> /dev/null
  pip install -r scripts/requirements.txt >> /var/log/threepics-autoupdate.log 2>&1
  deactivate
  log "✅ Python completed"

  # === STEP 6: Restart systemd services ===
  sudo /bin/systemctl restart "$SERVICE_FRONTEND"
  sudo /bin/systemctl restart "$SERVICE_BACKEND"
  log "🔄 Services restarted"
  touch  "$REPO_DIR/.reboot_required"

  # === STEP 7: Save last deployed tag ===
  echo "$LATEST_TAG" > "$LAST_TAG_FILE"
  log "✅ Update complete for tag $LATEST_TAG"

else
  log "⏳ No new tag found (current: $KNOWN_TAG)"
fi

