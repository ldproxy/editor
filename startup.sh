#!/bin/sh
set -eu

code-server --install-extension /ldproxy-editor.vsix

exec dumb-init /usr/bin/xtracfg listen 8081 --debug --verbose &
