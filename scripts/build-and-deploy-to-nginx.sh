#!/bin/bash

set -e

GREEN="\e[32m"
RED="\e[31m"
RESET="\e[0m"

print_status() {
  local message="$1"
  local status="$2"

  if [ "$status" = "ok" ]; then
    echo -e "[ ${GREEN}OK${RESET} ] $message"
  else
    echo -e "[ ${RED}FAIL${RESET} ] $message"
  fi
}

TARGET_DIR="/var/www/html/ultiTTT"
CLIENT_DIR="../client"
BUILD_DIR="$CLIENT_DIR/build"

if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (use sudo)" >&2
  print_status "Check root permissions" "fail"
  exit 1
else
  print_status "Check root permissions" "ok"
fi

echo "Building client app in '$CLIENT_DIR'..."
cd "$CLIENT_DIR"
npm install >/dev/null 2>&1 && npm run build >/dev/null 2>&1

if [ $? -eq 0 ] && [ -d "$BUILD_DIR" ]; then
  print_status "Client build" "ok"
else
  print_status "Client build" "fail"
  exit 1
fi

print_status "Deploying to $TARGET_DIR" "ok"

rm -rf "$TARGET_DIR" && print_status "Remove old files" "ok" || { print_status "Remove old files" "fail"; exit 1; }

cp -r "$BUILD_DIR" "$TARGET_DIR" && print_status "Copy build files" "ok" || { print_status "Copy build files" "fail"; exit 1; }

chmod -R 755 "$TARGET_DIR" && print_status "Set permissions" "ok" || { print_status "Set permissions" "fail"; exit 1; }

print_status "Deployment completed successfully" "ok"
