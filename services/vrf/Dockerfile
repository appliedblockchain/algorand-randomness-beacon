# node:16.16.0-alpine3.16
FROM node@sha256:d39ab4712a8395d0b399dea44d9cb8b34ac942411b6a380449ebdb9d321136a3 as builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN apk add --no-cache --virtual .gyp python3=3.10.8-r0 make=4.3-r0 gcc=11.2.1_git20220219-r2 py3-pip=22.1.1-r0 g++=11.2.1_git20220219-r2
RUN npm install -g node-gyp
RUN npm install &&\
  npm run build:proto &&\
  npm run build &&\
  rm -rf node_modules &&\
  npm ci --only=production

# node:16.16.0-alpine3.16
FROM node@sha256:d39ab4712a8395d0b399dea44d9cb8b34ac942411b6a380449ebdb9d321136a3 as prod
RUN apk add --no-cache dumb-init=1.2.5-r1
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node ./package*.json /usr/src/app/
COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node ./src/proto/vrf.proto /usr/src/app/dist/proto/vrf.proto

USER node
CMD ["dumb-init", "node", "dist/index.js"]
