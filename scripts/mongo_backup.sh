#!/bin/bash

set -e

source "$(dirname "$0")/lib.sh"
source "$PROJECT_ROOT/.env"

CONTAINER_NAME="ultittt-mongodb"
BACKUP_DIR="$PROJECT_ROOT/data/backups"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

USE_DEV_MODE=0
if [[ "$1" == "--dev" ]]; then
  USE_DEV_MODE=1
fi

mkdir -p "$BACKUP_PATH"

print_status "Starting MongoDB backup at $TIMESTAMP..." "info"

if [[ $USE_DEV_MODE -eq 1 ]]; then
  print_status "Running mongodump in DEV mode (no authentication)." "info"
  run_step_cmd "Run mongodump" docker exec "$CONTAINER_NAME" mongodump --out /data/backup_temp
else
  print_status "Running mongodump in AUTH mode (with username/password)." "info"
  if ! docker exec "$CONTAINER_NAME" mongodump \
    --username "$MONGO_INITDB_ROOT_USERNAME" \
    --password "$MONGO_INITDB_ROOT_PASSWORD" \
    --authenticationDatabase admin \
    --out /data/backup_temp
  then
    print_status "mongodump failed to authenticate. If you are running MongoDB without authentication (dev mode), try running this script with the --dev option:" "fail"
    echo "  sh scripts/mongo_backup.sh --dev"
    exit 1
  fi
fi

run_step_cmd "Save backup to $BACKUP_PATH" docker cp "$CONTAINER_NAME":/data/backup_temp "$BACKUP_PATH"
run_step_cmd "Delete backup in docker container" docker exec "$CONTAINER_NAME" rm -rf /data/backup_temp

run_step_cmd "Compress backup to tar.gz" tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
run_step_cmd "Delete uncompressed backup" rm -rf "$BACKUP_PATH"

run_step_cmd "Prune old backups (keep 10 latest)" bash -c "
  cd \"$BACKUP_DIR\"
  ls -1t backup_*.tar.gz | tail -n +11 | xargs -r rm --
"

print_status "Backup saved to $BACKUP_PATH.tar.gz\n" "info"
