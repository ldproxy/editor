#!/bin/sh
set -eu

code-server --install-extension /ldproxy-editor.vsix

exec dumb-init /usr/bin/xtracfg listen 8081 --debug --verbose &

if [ -n "${PASSWORD}" ]; then 
  export AUTH="password"
else
  export AUTH="none"
fi

if [ -n "${GIT_DATA}" ]; then
  echo "Cloning ${GIT_DATA} to /data"
  sudo rm -rf /data/*
  sudo chown coder. /data
  git clone "${GIT_DATA}" --branch "${GIT_DATA_BRANCH:-master}" --single-branch /data
fi
