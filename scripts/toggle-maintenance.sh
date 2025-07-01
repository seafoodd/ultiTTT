#!/bin/bash

source "$(dirname "$0")/lib.sh"

if [ "$(id -u)" -ne 0 ]; then
    print_status "Check root permissions" "fail"
    echo "Error: This script must be run with sudo."
    exit 1
else
    print_status "Check root permissions" "ok"
fi

FLAG_FILE="/var/www/html/ultiTTT/maintenance.flag"

run_step_cmd "Toggle maintenance flag" bash -c "
  if [ -f '$FLAG_FILE' ]; then
    rm '$FLAG_FILE'
  else
    touch '$FLAG_FILE'
  fi
"
if [ -f '$FLAG_FILE' ]; then
  print_status 'The site is now ONLINE.' 'info'
else
  print_status 'The site is now in MAINTENANCE mode.' 'info'
fi
echo ""
