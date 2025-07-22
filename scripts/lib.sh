#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export PROJECT_ROOT

RED="\e[31m"
BLUE="\e[34m"
GREEN="\e[32m"
RESET="\e[0m"

print_status() {
  local message="$1"
  local status="$2"

  if [ "$status" = "ok" ]; then
    echo -e "[  ${GREEN}OK${RESET}  ] $message"
  elif [ "$status" = "info" ]; then
    echo -e "[ ${BLUE}INFO${RESET} ] $message"
  else
    echo -e "[ ${RED}FAIL${RESET} ] $message"
  fi
}

run_step_cmd() {
  local message="$1"
  shift

  if "$@" > /dev/null; then
    print_status "$message" "ok"
  else
    print_status "$message" "fail"
    print_status "Exiting due to failure." "info"
    exit 1
  fi
}

production_only_warning() {
  if [ -t 0 ]; then
    echo "WARNING: This script is intended ONLY for setting up the PRODUCTION environment."
    read -rp "Are you sure you want to continue? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      echo "Aborted by user."
      exit 1
    fi
  fi

  if [ "$EUID" -ne 0 ]; then
    print_status "Check root permissions" "fail"
    echo "Error: This script must be run as root (use sudo)"
    exit 1
  else
    print_status "Check root permissions" "ok"
  fi
}