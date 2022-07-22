# VRF Oracle

A VRF oracle on Algorand's blockchain.

# Requirements

- Node.js

# App setup

1. The app depends on an [N-API sodium-native](https://github.com/appliedblockchain/sodium-native) module that we need to build. (For now as once we finish development perhaps we will publish the module to NPM).
    ```sh
    git submodule update --init --recursive
    ```

2. Intall dependencies. The install script also builds the [N-API sodium-native](https://github.com/appliedblockchain/sodium-native) module.

    ```sh
    npm install
    ```
3. Copy `.env-example` file to `.env`

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
