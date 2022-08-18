# VRF Oracle

A VRF oracle on Algorand's blockchain.

# Requirements

- Node.js >= 16.16.0
- Docker

# Services description

- App: Main service that runs in a loop to check when to generate the VRF value and submit the value to the smart contract.
- VRF Generator: Isolated component to generate the VRF random value.

# Services setup

1. Copy `.env-example` file to `.env`

# Development

You can develop using docker or locally.

## Locally

Run npm install on each service and then
```sh
npm run start:dev
```

## Docker

```sh
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up
```

# Build

```sh
docker-compose build
```
