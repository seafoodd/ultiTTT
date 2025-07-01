#!/bin/bash

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

  if "$@" > /dev/null 2>&1; then
    print_status "$message" "ok"
  else
    print_status "$message" "fail"
    print_status "Exiting due to failure." "info"
    exit 1
  fi
}
