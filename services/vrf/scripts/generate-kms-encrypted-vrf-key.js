const AWS = require('@aws-sdk/client-kms')
const sodium = require('@appliedblockchain/sodium-native-vrf')
const pk = Buffer.alloc(sodium.crypto_vrf_PUBLICKEYBYTES)
const sk = Buffer.alloc(sodium.crypto_vrf_SECRETKEYBYTES)
sodium.crypto_vrf_keypair(pk, sk)

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

const client = new AWS.KMS({
  credentials,
  region: process.env.AWS_REGION,
})

client
  .encrypt({
    Plaintext: sk,
    KeyId: process.env.AWS_KMS_KEY_ID,
  })
  .then((result) => {
    console.log('Public key: ', pk.toString('hex'))
    console.log('Encripted secret key: ', Buffer.from(result.CiphertextBlob).toString('base64'))
  })
