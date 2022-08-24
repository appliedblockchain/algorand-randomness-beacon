# node:16.16.0-alpine3.16
FROM node@sha256:1c8769a8c9ed57817ef07162744a3722421333a438185c560aa42a9a1fc6ea23 as builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && npm run build:proto && npm run build

# node:16.16.0-alpine3.16
FROM node@sha256:1c8769a8c9ed57817ef07162744a3722421333a438185c560aa42a9a1fc6ea23 as prod
RUN apk add dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node ./package*.json /usr/src/app/
COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --chown=node:node ./src/contract.json /usr/src/app/dist/contract.json
COPY --chown=node:node ./src/proto/vrf.proto /usr/src/app/dist/proto/vrf.proto
RUN npm ci --only=production

USER node
CMD ["dumb-init", "node", "dist/index.js"]
