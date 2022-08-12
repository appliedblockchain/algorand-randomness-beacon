const sodium = require('@appliedblockchain/sodium-native-vrf')
const pk = Buffer.alloc(sodium.crypto_vrf_PUBLICKEYBYTES)
const sk = Buffer.alloc(sodium.crypto_vrf_SECRETKEYBYTES)
sodium.crypto_vrf_keypair(pk, sk)
console.log({ pk: pk.toString('hex'), sk: sk.toString('hex') })
