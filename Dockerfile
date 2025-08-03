# --- Frontend Build Stage ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-workspace.yaml ./
COPY frontend/ ./
RUN npm install -g pnpm && \
    pnpm config set prefer-frozen-lockfile false && \
    pnpm install --no-strict-peer-dependencies  && \
    pnpm run build


# --- Backend Stage ---
FROM node:20-slim

# Systemabhängigkeiten (für Python)
RUN apt-get update && apt-get install -y \
    python3 python3-requests \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend-Dateien kopieren
COPY backend/package.json ./backend/
COPY backend/ ./backend/

# Frontend-Build kopieren
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Installiere Backend-Abhängigkeiten
WORKDIR /app/backend
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]

