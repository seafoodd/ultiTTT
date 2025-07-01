#!/bin/bash

set -e

REPO_ROOT="$(dirname "$(realpath "$0")")/.."
cd "$REPO_ROOT"

echo "[INFO] Pulling latest changes from Git..."
git fetch origin
CHANGED_FILES=$(git diff --name-only HEAD origin/$(git rev-parse --abbrev-ref HEAD))

if [ -z "$CHANGED_FILES" ]; then
  echo "[ OK ] No changes found. Exiting."
  exit 0
fi

git pull

# Flags
CLIENT_CHANGED=false
SERVER_CHANGED=false

while read -r file; do
  [[ "$file" == client/* ]] && CLIENT_CHANGED=true
  [[ "$file" == server/* || "$file" == docker-compose.yml || "$file" == .env ]] && SERVER_CHANGED=true
done <<< "$CHANGED_FILES"

if $CLIENT_CHANGED; then
  echo "[INFO] Detected changes in client. Rebuilding and deploying client..."
  cd "$REPO_ROOT/scripts"
  sudo ./build-and-deploy-to-nginx.sh
  echo "[ OK ] Client redeployed."
fi

if $SERVER_CHANGED; then
  echo "[INFO] Detected changes in server/docker-compose. Rebuilding Docker services..."
  cd "$REPO_ROOT"
  docker-compose pull
  docker-compose up -d --build
  echo "[ OK ] Server services rebuilt and restarted."
fi

echo "[ OK ] Redeployment complete."
