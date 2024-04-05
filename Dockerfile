FROM node:20-alpine as extension

COPY . /src/
RUN cd /src && npm run install:all && npm test && npm run package


FROM ghcr.io/ldproxy/xtracfg@sha256:66e226de6d1218335104640659b435045c2e5e0c121017bb38314ce7ca1a6e5e as xtracfg


FROM codercom/code-server:latest

COPY --chmod=0644 --from=extension /src/dist/ldproxy-editor.vsix /
COPY --chmod=0755 --from=extension /src/startup.sh /entrypoint.d/
COPY --chmod=0755 --from=xtracfg /xtracfg /usr/bin/

ENV HOME=/settings
VOLUME /settings
VOLUME /data
USER root

ENTRYPOINT ["/usr/bin/entrypoint.sh", "--ignore-last-opened", "--bind-addr", "0.0.0.0:80", "--welcome-text", "\"Hello\"", "--app-name", "\"ldproxy-editor\"", "--disable-telemetry", "--disable-update-check", "--disable-workspace-trust", "--disable-getting-started-override", "/data"]
