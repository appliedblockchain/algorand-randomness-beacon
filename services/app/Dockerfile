# node:16.16.0-alpine3.16
FROM node@sha256:9a2db0008b592cfde1b98aa8972a8051ccb80bb51dde8b06c3a2e3762794e89c as builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && npm run build:proto && npm run build

# node:16.16.0-alpine3.16
FROM node@sha256:9a2db0008b592cfde1b98aa8972a8051ccb80bb51dde8b06c3a2e3762794e89c as prod
RUN apk add dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node ./package*.json /usr/src/app/
COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --chown=node:node ./src/proto/vrf.proto /usr/src/app/dist/proto/vrf.proto
RUN npm ci --only=production

USER node
CMD ["dumb-init", "node", "dist/index.js"]
