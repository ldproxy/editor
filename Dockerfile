FROM node:20-bullseye-slim AS build

WORKDIR /app
COPY ./theia-app/ ./

# Build tools for native addons
RUN apt-get update && apt-get install -y python3 make g++ git 

# Install dependencies
RUN yarn install --frozen-lockfile

# Build plugin
RUN cd empty && yarn prepare

# Build theia
RUN npm run build:browser


###
FROM node:20-bullseye-slim

COPY --from=build /app /home/theia-app

RUN mkdir /data

WORKDIR /home/theia-app/browser-app

CMD ["yarn", "run", "startPlugin", "/data"]

