import sodium from 'sodium-native'
import { KeyPair } from '../types'

export const generateVrfKeyPair = (): KeyPair => {
  const pk = Buffer.alloc(sodium.crypto_vrf_PUBLICKEYBYTES)
  const sk = Buffer.alloc(sodium.crypto_vrf_SECRETKEYBYTES)
  sodium.crypto_vrf_keypair(pk, sk)
  return { pk, sk }
}

export const vrfProve = (sk: Buffer, msg: Buffer): Buffer => {
  const proof = Buffer.alloc(sodium.crypto_vrf_PROOFBYTES)
  try {
    sodium.crypto_vrf_prove(proof, sk, msg)
    return proof
  } catch (error) {
    console.error('Error computing vrf proof', error)
    throw error
  }
}

export const vrfProofToHash = (proof: Buffer) => {
  const hash = Buffer.alloc(sodium.crypto_vrf_OUTPUTBYTES)
  try {
    sodium.crypto_vrf_proof_to_hash(hash, proof)
    return hash
  } catch (error) {
    console.error('Error computing vrf output', error)
    throw error
  }
}

export const vrfVerify = (pk: Buffer, proof: Buffer, message: Buffer) => {
  const output = Buffer.alloc(sodium.crypto_vrf_OUTPUTBYTES)
  try {
    sodium.crypto_vrf_verify(output, pk, proof, message)
    return output
  } catch (error) {
    console.error('Error computing vrf output', error)
    throw error
  }
}

export const vrfSkToPk = (skpk: Buffer): Buffer => {
  const pk = Buffer.alloc(sodium.crypto_vrf_PUBLICKEYBYTES)
  sodium.crypto_vrf_sk_to_pk(pk, skpk)

  return pk
}
