#!/bin/bash

set -e

source "$(dirname "$0")/lib.sh"

TARGET_DIR="/var/www/html/ultiTTT"
CLIENT_DIR="../client"
BUILD_DIR="$CLIENT_DIR/build"

if [ "$EUID" -ne 0 ]; then
  print_status "Check root permissions" "fail"
  echo "Error: This script must be run as root (use sudo)" /dev/null 2>&1
  exit 1
else
  print_status "Check root permissions" "ok"
fi

run_step_cmd "Install packages" npm install --prefix "$CLIENT_DIR"
run_step_cmd "Build client app" npm run build --prefix "$CLIENT_DIR"
run_step_cmd "Remove old files" rm -rf "$TARGET_DIR"
run_step_cmd "Copy build files" cp -r "$BUILD_DIR" "$TARGET_DIR"
run_step_cmd "Set permissions" chmod -R 755 "$TARGET_DIR"

print_status "Deployment completed successfully.\n" "info"
