#!/bin/sh
set -e

if [ -z "${PASSWORD}" ]; then 
  mkdir -p /home/coder/.config/code-server
  echo "auth: none" > /home/coder/.config/code-server/config.yaml
  echo "cert: false" >> /home/coder/.config/code-server/config.yaml
fi

if [ -n "${GIT_DATA}" ]; then
  echo "Cloning ${GIT_DATA} to /data"
  sudo rm -rf /data/*
  sudo chown coder. /data
  git clone "${GIT_DATA}" --branch "${GIT_DATA_BRANCH:-master}" --single-branch /data
fi

code-server --install-extension /ldproxy-editor.vsix

exec dumb-init /usr/bin/xtracfg listen 8081 --debug --verbose &


