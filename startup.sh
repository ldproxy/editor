#!/bin/sh
set -e

if [ -z "${PASSWORD}" ]; then 
  mkdir -p /settings/.config/code-server
  echo "auth: none" > /settings/.config/code-server/config.yaml
  echo "cert: false" >> /settings/.config/code-server/config.yaml
fi

if [ -n "${GIT_DATA}" ]; then
  echo "Cloning ${GIT_DATA} to /data"
  sudo rm -rf /data/*
  sudo chown coder. /data
  git clone "${GIT_DATA}" --branch "${GIT_DATA_BRANCH:-master}" --single-branch /data
fi

if [ ! -f "/settings/.local/share/code-server/User/settings.json" ]; then
    mkdir -p /settings/.local/share/code-server/User
    echo "{\"editor.suggest.showWords\": false, \"workbench.colorTheme\": \"Default Dark Modern\", \"editor.suggest.showStatusBar\": true}" > /settings/.local/share/code-server/User/settings.json
fi

code-server --install-extension /ldproxy-editor.vsix

exec dumb-init /usr/bin/xtracfg listen 8081 --debug --verbose &


