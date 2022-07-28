# node:16.16.0-alpine3.16
FROM node@sha256:9a2db0008b592cfde1b98aa8972a8051ccb80bb51dde8b06c3a2e3762794e89c as builder

COPY ./ ./app

WORKDIR /app
RUN npm install
RUN npm run build

FROM node@sha256:9a2db0008b592cfde1b98aa8972a8051ccb80bb51dde8b06c3a2e3762794e89c as prod

COPY ./package*.json ./app

COPY --from=builder app/dist ./app/dist

WORKDIR /app
RUN npm install --only=production

CMD [ "npm", "run", "start" ]
