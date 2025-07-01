#!/bin/bash

set -e

source "$(dirname "$0")/lib.sh"

CONTAINER_NAME="ultittt-mongodb"
BACKUP_DIR="../data/backups"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

print_status "Starting MongoDB backup at $TIMESTAMP...\n" "info"
run_step_cmd "Run mongodump" docker exec "$CONTAINER_NAME" mongodump --out /data/backup_temp
run_step_cmd "Save backup to $BACKUP_PATH" docker cp "$CONTAINER_NAME":/data/backup_temp "$BACKUP_PATH"
run_step_cmd "Delete backup in docker container" docker exec "$CONTAINER_NAME" rm -rf /data/backup_temp

run_step_cmd "Compress backup to tar.gz" tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
run_step_cmd "Delete uncompressed backup" rm -rf "$BACKUP_PATH"

run_step_cmd "Prune old backups (keep 10 latest)" bash -c "
  cd \"$BACKUP_DIR\"
  ls -1t backup_*.tar.gz | tail -n +11 | xargs -r rm --
"

print_status "Backup saved to $BACKUP_PATH.tar.gz\n" "info"

