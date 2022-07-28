# VRF Oracle

A VRF oracle on Algorand's blockchain.

# Requirements

- Node.js

# Services

- App: Main service that runs in a loop to check when to generate the VRF value and create the transaction.
- VRF Generator: Isolated component to generate the VRF random value

# Services setup

1. Copy `.env-example` file to `.env`

# Development

```sh
npm run start:dev
```


# Build

```sh
npm run build
```

# Run the app

```sh
npm start
```
