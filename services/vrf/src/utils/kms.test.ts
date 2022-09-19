import decryptVrfKey, { client } from './kms'

const VRF_KEY =
  '43b29245b59cff910b5d1530ea62c47152eda9fa658df456804437e7bdc9d19c3f3e8144973458cc1d89d73125791689fb8e5186fccf03d853bf758ccd2eb8f9'

const originalEnv = process.env

describe('KMS', () => {
  describe('decryptVrfKey()', () => {
    beforeEach(async () => {
      const kmsKey = await client.createKey({})
      const kmsKeyId = kmsKey.KeyMetadata.KeyId
      await client.enableKey({ KeyId: kmsKeyId })
      const { CiphertextBlob } = await client.encrypt({
        KeyId: kmsKeyId,
        Plaintext: Buffer.from(VRF_KEY, 'hex'),
      })
      jest.resetModules()
      process.env = {
        ...originalEnv,
        AWS_KMS_KEY_ID: kmsKeyId,
        VRF_ENCRYPTED_KEY: Buffer.from(CiphertextBlob).toString('base64'),
      }
    })
    it('decrypts the key', async () => {
      const key = await decryptVrfKey()
      expect(key).toEqual(VRF_KEY)
    })

    it('get the cached value after first call', async () => {
      const clientDecryptMock = jest.spyOn(client, 'decrypt')
      const key = await decryptVrfKey()
      expect(key).toEqual(VRF_KEY)
      expect(clientDecryptMock).not.toHaveBeenCalled()
    })
  })
})
