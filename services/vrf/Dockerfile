# node:16.16.0-alpine3.16
FROM node@sha256:1c8769a8c9ed57817ef07162744a3722421333a438185c560aa42a9a1fc6ea23 as builder
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install &&\
  npm run build:proto &&\
  npm run build &&\
  rm -rf node_modules &&\
  npm ci --only=production

# node:16.16.0-alpine3.16
FROM node@sha256:1c8769a8c9ed57817ef07162744a3722421333a438185c560aa42a9a1fc6ea23 as prod

RUN apk update && apk add dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node ./package*.json /usr/src/app/
COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node ./src/proto/vrf.proto /usr/src/app/dist/proto/vrf.proto

USER node
CMD ["dumb-init", "node", "dist/index.js"]
