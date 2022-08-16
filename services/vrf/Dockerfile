# node:16.16.0
FROM node@sha256:8cb8d1582f235b30eea033baddde78b17143348fb392154d4c67a3c08307a8f2 as builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install &&\
  npm run build:proto &&\
  npm run build &&\
  rm -rf node_modules &&\
  npm ci --only=production

# node:16.16.0
FROM node@sha256:8cb8d1582f235b30eea033baddde78b17143348fb392154d4c67a3c08307a8f2 as prod
RUN apt-get update -y && apt-get install -y dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node ./package*.json /usr/src/app/
COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node ./src/proto/vrf.proto /usr/src/app/dist/proto/vrf.proto

USER node
CMD ["dumb-init", "node", "dist/index.js"]
