FROM node:20-alpine as builder

COPY . /src/

RUN cd /src && npm run install:all && npm run package

FROM codercom/code-server:latest

COPY --from=builder /src/dist/ldproxy-editor.vsix /home/coder/

RUN code-server --install-extension /home/coder/ldproxy-editor.vsix

VOLUME /data

ENTRYPOINT ["/usr/bin/entrypoint.sh", "--auth", "none", "--ignore-last-opened", "--bind-addr", "0.0.0.0:8080", "--welcome-text", "\"Hello\"", "--app-name", "\"ldproxy-editor\"", "--disable-telemetry", "--disable-update-check", "--disable-workspace-trust", "--disable-getting-started-override", "/data"]
