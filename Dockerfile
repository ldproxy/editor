FROM node:20-alpine as extension

COPY . /src/
RUN cd /src && npm run install:all && npm run package


FROM ghcr.io/ldproxy/xtracfg:next as xtracfg


FROM codercom/code-server:latest

COPY --chmod=0644 --from=extension /src/dist/ldproxy-editor.vsix /
COPY --chmod=0755 --from=extension /src/startup.sh /entrypoint.d/
COPY --chmod=0755 --from=xtracfg /xtracfg /usr/bin/

VOLUME /home/coder
VOLUME /data

ENTRYPOINT ["/usr/bin/entrypoint.sh", "--auth", "none", "--ignore-last-opened", "--bind-addr", "0.0.0.0:80", "--welcome-text", "\"Hello\"", "--app-name", "\"ldproxy-editor\"", "--disable-telemetry", "--disable-update-check", "--disable-workspace-trust", "--disable-getting-started-override", "/data"]