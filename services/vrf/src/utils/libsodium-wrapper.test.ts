import sodium from '@appliedblockchain/sodium-native-vrf'
import { generateVrfKeyPair, vrfProve, vrfProofToHash, vrfVerify, vrfSkToPk } from './libsodium-wrapper'

describe('libsodium-wrapper', () => {
  it('generateVrfKeyPair()', () => {
    const { pk, sk } = generateVrfKeyPair()
    expect(pk).toBeTruthy()
    expect(sk).toBeTruthy()
  })

  describe('vrfProve()', () => {
    it('creates the proof', () => {
      const { sk } = generateVrfKeyPair()
      const message = Buffer.from('random value')
      const proof = vrfProve(sk, message)
      expect(proof.toString('hex').length).toBe(sodium.crypto_vrf_PROOFBYTES * 2)
    })

    it('throws error when failing decoding the key', () => {
      const { sk } = generateVrfKeyPair()
      const message = Buffer.from('random value')
      expect(() => vrfProve(Buffer.from('invalid-key'), message)).toThrow()
    })
  })

  describe('vrfProofToHash()', () => {
    it('generates the proof hash', () => {
      const { sk } = generateVrfKeyPair()
      const message = Buffer.from('random value')
      const proof = vrfProve(sk, message)
      const hash = vrfProofToHash(proof)
      expect(hash.toString('hex').length).toBe(sodium.crypto_vrf_OUTPUTBYTES * 2)
    })

    it('throws error on failure decoding the proof', () => {
      const proof = Buffer.from('invalid proof')
      expect(() => vrfProofToHash(proof)).toThrow()
    })
  })

  describe('vrfVerify()', () => {
    it('verify and return the proof hash', () => {
      const { sk, pk } = generateVrfKeyPair()
      const message = Buffer.from('random value')
      const proof = vrfProve(sk, message)
      const hash = vrfProofToHash(proof)
      const output = vrfVerify(pk, proof, message)
      expect(output.toString('hex').length).toBe(sodium.crypto_vrf_OUTPUTBYTES * 2)
      expect(hash.toString('hex')).toBe(output.toString('hex'))
    })

    it('throws error on invalid proof', () => {
      const { sk, pk } = generateVrfKeyPair()
      const message = Buffer.from('random value')
      const proof = vrfProve(sk, message)
      const anotherMessage = Buffer.from('Not the message used to make the proof')
      expect(() => vrfVerify(pk, proof, anotherMessage)).toThrow()
    })
  })

  describe('vrfSkToPk()', () => {
    it('get publick key from secret key', () => {
      const { sk, pk } = generateVrfKeyPair()
      const resultPk = vrfSkToPk(sk)

      expect(pk).toEqual(resultPk)
    })
  })
})
