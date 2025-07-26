#!/bin/bash

echo "🧹 Cleaning up node_modules..."

if [ -d frontend/node_modules ]; then
  echo "🗑️  Removing frontend/node_modules"
  rm -rf frontend/node_modules
else
  echo "✅ frontend/node_modules does not exist"
fi

if [ -d backend/node_modules ]; then
  echo "🗑️  Removing backend/node_modules"
  rm -rf backend/node_modules
else
  echo "✅ backend/node_modules does not exist"
fi

echo "🐳 Building Docker containers (no cache)..."
if docker compose build --no-cache; then
  echo "🚀 Starting Docker containers..."
  docker compose up
else
  echo "❌ Docker build failed. Aborting."
  exit 1
fi
