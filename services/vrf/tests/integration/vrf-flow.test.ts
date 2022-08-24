import { generateVrfKeyPair, vrfProofToHash, vrfProve, vrfVerify } from '../../src/utils/libsodium-wrapper'

describe('VRF', () => {
  describe('Generation and verification', () => {
    it('SHOULD generate and verify the proof', () => {
      const oracleKeyPair = generateVrfKeyPair()
      const vrfInput = Buffer.from('random input')
      const proof = vrfProve(oracleKeyPair.sk, vrfInput)
      const hash = vrfProofToHash(proof)
      expect(hash).toBeTruthy()
      const output = vrfVerify(oracleKeyPair.pk, proof, vrfInput)
      expect(hash.toString('hex')).toBe(output.toString('hex'))
    })

    it('SHOULD fail proof verification with a different input', () => {
      const oracleKeyPair = generateVrfKeyPair()
      const vrfInput = Buffer.from('random input')
      const proof = vrfProve(oracleKeyPair.sk, vrfInput)
      const hash = vrfProofToHash(proof)
      expect(hash).toBeTruthy()
      expect(() => vrfVerify(oracleKeyPair.pk, proof, Buffer.from('different input'))).toThrow()
    })

    it('SHOULD fail proof verification with a different private key', () => {
      const oracleKeyPair = generateVrfKeyPair()
      const vrfInput = Buffer.from('random input')
      const proof = vrfProve(oracleKeyPair.sk, vrfInput)
      const hash = vrfProofToHash(proof)
      expect(hash).toBeTruthy()
      const anotherKeyPairToVerify = generateVrfKeyPair()
      expect(() => vrfVerify(anotherKeyPairToVerify.pk, proof, vrfInput)).toThrow()
    })
  })
})
