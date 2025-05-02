#!/bin/bash

set -e

TARGET_DIR="/var/www/html/ultiTTT"

if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (use sudo)" >&2
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: sudo $0 <build-directory>" >&2
  exit 1
fi

SOURCE_DIR="$1"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory '$SOURCE_DIR' does not exist." >&2
  exit 1
fi

echo "Deploying from '$SOURCE_DIR' to '$TARGET_DIR'..."

echo "Removing existing target directory..."
rm -rf "$TARGET_DIR"

echo "Copying new build..."
cp -r "$SOURCE_DIR" "$TARGET_DIR"

echo "Setting permissions..."
chmod -R 755 "$TARGET_DIR/"

echo "Deployment completed successfully."
