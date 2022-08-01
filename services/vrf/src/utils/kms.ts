import * as AWS from '@aws-sdk/client-kms'

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

const LOCALSTACK_ENVIRONMENTS = ['development', 'local', 'test']
const useLocalstack = LOCALSTACK_ENVIRONMENTS.includes(process.env.NODE_ENV)

export const client = new AWS.KMS({
  credentials,
  region: process.env.AWS_REGION,
  endpoint: useLocalstack ? process.env.LOCALSTACK_ENDPOINT : undefined,
})

// Cache the key to avoid keep doing decrypt
let decryptedKey: string
const decryptVrfKey = async () => {
  if (decryptedKey) {
    return decryptedKey
  }

  const { Plaintext } = await client.decrypt({
    KeyId: process.env.AWS_KMS_KEY_ID,
    CiphertextBlob: Buffer.from(process.env.VRF_ENCRYPTED_KEY, 'base64'),
  })

  decryptedKey = Buffer.from(Plaintext).toString('utf-8')
  return decryptedKey
}

export default decryptVrfKey
