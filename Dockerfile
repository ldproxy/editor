FROM node:20-bullseye-slim AS build

WORKDIR /app
COPY ./theia-app/ ./

# Build tools for native addons
RUN apt-get update && apt-get install -y python3 make g++ git 

# Install dependencies
RUN yarn install --frozen-lockfile

# Run prepare in subfolder
WORKDIR /app/empty
RUN yarn prepare

# Back to root and start build
WORKDIR /app
RUN npm run build:browser

# Clean up build dependencies
RUN apt-get purge -y python3 make g++ && apt-get autoremove -y --purge

FROM node:20-bullseye-slim

WORKDIR /home/theia-app
COPY --from=build /app .

WORKDIR /home/theia-app/browser-app
CMD ["yarn", "run", "startPlugin", "/home/theia-app/data/"]

# ToDo, when using downloaded image: plugin-manager ERROR Activating plugin 'GitLens — Git supercharged' failed: 
# Error: Cannot find module '/home/theia-app/plugin/git/extension/dist/gitlens.js'
# Require stack:
# - /home/theia-app/browser-app/lib/backend/vendors-node_modules_theia_plugin-ext_lib_hosted_node_plugin-host_js.js
# - /home/theia-app/browser-app/lib/backend/plugin-host.js