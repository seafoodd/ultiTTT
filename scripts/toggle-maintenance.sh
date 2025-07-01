#!/bin/bash

if [ "$(id -u)" -ne 0 ]; then
    echo -e "Error: This script must be run with sudo."
    exit 1
fi

FLAG_FILE="/var/www/html/ultiTTT/maintenance.flag"

if [ -f "$FLAG_FILE" ]; then
    rm "$FLAG_FILE"
    echo "The site is now ONLINE."
else
    touch "$FLAG_FILE"
    echo "The site is now in MAINTENANCE mode."
fi