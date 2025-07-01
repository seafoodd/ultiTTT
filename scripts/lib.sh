#!/bin/bash

GREEN="\e[32m"
RED="\e[31m"
RESET="\e[0m"

print_status() {
  local message="$1"
  local status="$2"

  if [ "$status" = "ok" ]; then
    echo -e "[  ${GREEN}OK${RESET}  ] $message"
  elif [ "$status" = "info" ]; then
    echo -e "[ INFO ] $message"
  else
    echo -e "[ ${RED}FAIL${RESET} ] $message"
  fi
}

run_step_cmd() {
  local message="$1"
  shift
  echo -ne "[      ] $message"

  if "$@" > /dev/null; then
    echo -ne "\r"
    print_status "$message" "ok"
  else
    echo -ne "\r"
    print_status "$message" "fail"
    print_status "Exiting due to failure." "info"
    exit 1
  fi
}
