#!/bin/sh
set -e

#if [ ! -f "/settings/.local/share/code-server/User/settings.json" ]; then
#    mkdir -p /settings/.local/share/code-server/User
#    echo "{\"editor.suggest.showWords\": false, \"workbench.colorTheme\": \"Default Dark Modern\", \"editor.suggest.showStatusBar\": true}" > /settings/.local/share/code-server/User/settings.json
#fi

#code-server --install-extension /ldproxy-editor.vsix
#code-server --install-extension redhat.vscode-yaml

exec dumb-init /usr/bin/xtracfg listen 8081 --debug --verbose &

#yarn run startPlugin /data
node /home/theia/browser-app/lib/backend/main.js --hostname=0.0.0.0 --port=8080 --plugins="local-dir:/home/theia/plugin" /data 
