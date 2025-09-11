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
CMD ["yarn", "run", "startPlugin", "--hostname=0.0.0.0", "/home/theia-app/data/"]
