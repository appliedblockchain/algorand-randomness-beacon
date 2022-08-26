# node:16.16.0-alpine3.16
FROM node@sha256:d39ab4712a8395d0b399dea44d9cb8b34ac942411b6a380449ebdb9d321136a3 as builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN apk add --no-cache --virtual .gyp python3 make gcc py3-pip g++
RUN npm install -g node-gyp
RUN npm install &&\
  npm run build:proto &&\
  npm run build &&\
  rm -rf node_modules &&\
  npm ci --only=production

# node:16.16.0-alpine3.16
FROM node@sha256:d39ab4712a8395d0b399dea44d9cb8b34ac942411b6a380449ebdb9d321136a3 as prod
RUN apk update && apk add dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node ./package*.json /usr/src/app/
COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node ./src/proto/vrf.proto /usr/src/app/dist/proto/vrf.proto

USER node
CMD ["dumb-init", "node", "dist/index.js"]
