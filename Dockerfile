###
FROM node:20-bookworm-slim AS build

# Build tools for native addons
RUN apt-get update -y && apt-get install -y python3 make g++ git

WORKDIR /home/theia

# Copy repository files
COPY ./theia-app/ ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Build plugin
RUN cd empty && yarn prepare

# Build theia
RUN npm run build:browser

###
FROM ghcr.io/ldproxy/xtracfg:4.3.5 AS xtracfg

###
FROM node:20-bookworm-slim

RUN apt-get update -y &&  \ 
    apt-get install --no-install-recommends -y \
      procps \
      dumb-init \
      git \
      git-lfs \
    && git lfs install \    
    && rm -rf /var/lib/apt/lists/*

# Create theia user and directories
# Application will be copied to /home/theia
# Default workspace is located at /data
RUN adduser --system --group theia
RUN chmod g+rw /home && \
    mkdir -p /home/theia && \
    mkdir -p /data && \
    chown -R theia:theia /home/theia && \
    chown -R theia:theia /data;

COPY --from=build --chown=theia:theia /home/theia /home/theia
COPY --from=xtracfg --chmod=0755 /xtracfg /usr/bin/

# Specify default shell for Theia and the Built-In plugins directory
# Use installed git instead of dugite
ENV SHELL=/bin/bash \
    HOME=/home/theia \
    USE_LOCAL_GIT=true \
    THEIA_DEFAULT_PLUGINS=local-dir:/home/theia/plugin \
    THEIA_WEBVIEW_EXTERNAL_ENDPOINT=""

# Switch to Theia user
USER theia
WORKDIR /home/theia/browser-app

EXPOSE 8080

#CMD ["yarn", "run", "startPlugin", "/data"]
ENTRYPOINT ["/bin/sh", "/home/theia/startup.sh"]

