#!/bin/sh
set -eu

node server.js &
next_pid="$!"

apache2ctl -D FOREGROUND &
apache_pid="$!"

stop() {
  kill "$next_pid" "$apache_pid" 2>/dev/null || true
}

trap stop INT TERM EXIT

while true; do
  if ! kill -0 "$next_pid" 2>/dev/null; then
    wait "$next_pid"
    exit $?
  fi

  if ! kill -0 "$apache_pid" 2>/dev/null; then
    wait "$apache_pid"
    exit $?
  fi

  sleep 2
done
