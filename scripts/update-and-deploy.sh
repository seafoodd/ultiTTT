#!/bin/bash

set -e

source "$(dirname "$0")/lib.sh"

production_only_warning

cd "$PROJECT_ROOT"

print_status "Pulling latest changes from Git..." "info"
run_step_cmd "Git fetch origin" git fetch origin

CHANGED_FILES=$(git diff --name-only HEAD "origin/$(git rev-parse --abbrev-ref HEAD)")

if [ -z "$CHANGED_FILES" ]; then
  print_status "No changes found. Exiting.\n" "info"
  exit 0
fi

run_step_cmd "Git pull latest changes" git pull

CLIENT_CHANGED=false
SERVER_CHANGED=false

while read -r file; do
  [[ "$file" == client/* ]] && CLIENT_CHANGED=true
  [[ "$file" == server/* || "$file" == docker-compose.yml || "$file" == .env ]] && SERVER_CHANGED=true
done <<< "$CHANGED_FILES"

if $CLIENT_CHANGED; then
  echo
  print_status "Detected changes in client. Rebuilding and deploying client..." "info"
  cd "$PROJECT_ROOT/scripts"
  sudo ./build-and-deploy-to-nginx.sh
fi

if $SERVER_CHANGED; then
  print_status "Detected changes in server/docker-compose. Rebuilding Docker services..." "info"
  cd "$PROJECT_ROOT"
  run_step_cmd "Pull Docker images" docker-compose pull
  run_step_cmd "Rebuild and restart Docker services" docker-compose up -d --build
  print_status "Server services rebuilt and restarted." "ok"
  echo
fi

print_status "Redeployment complete.\n" "info"