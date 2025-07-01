#!/bin/bash

set -e

source "$(dirname "$0")/lib.sh"

REPO_ROOT="$(dirname "$(realpath "$0")")/.."
cd "$REPO_ROOT"

echo "[INFO] Pulling latest changes from Git..."
run_step_cmd "Git fetch origin" git fetch origin

CHANGED_FILES=$(git diff --name-only HEAD origin/$(git rev-parse --abbrev-ref HEAD))

if [ -z "$CHANGED_FILES" ]; then
  print_status "No changes found. Exiting." "ok"
  exit 0
fi

run_step_cmd "Git pull latest changes" git pull

CLIENT_CHANGED=false
SERVER_CHANGED=false

while read -r file; do
  [[ "$file" == client/* ]] && CLIENT_CHANGED=true
  [[ "$file" == server/* || "$file" == docker-compose.yml || "$file" == .env ]] && SERVER_CHANGED=true
done <<< "$CHANGED_FILES"
echo ""

if $CLIENT_CHANGED; then
  echo "[INFO] Detected changes in client. Rebuilding and deploying client..."
  cd "$REPO_ROOT/scripts"
  sudo ./build-and-deploy-to-nginx.sh
  echo ""
fi

if $SERVER_CHANGED; then
  echo "[INFO] Detected changes in server/docker-compose. Rebuilding Docker services..."
  cd "$REPO_ROOT"
  run_step_cmd "Pull Docker images" docker-compose pull > /dev/null
  run_step_cmd "Rebuild and restart Docker services" docker-compose up -d --build > /dev/null
  print_status "Server services rebuilt and restarted." "ok"
  echo ""
fi

echo "[INFO] Redeployment complete."
