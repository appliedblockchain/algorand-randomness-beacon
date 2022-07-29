declare module '@appliedblockchain/sodium-native-vrf' {
  /**
   * Create a new keypair.
   *
   * * `publicKey` should be a buffer with length `crypto_vrf_PUBLICKEYBYTES`.
   * * `secretKey` should be a buffer with length `crypto_vrf_SECRETKEYBYTES`.
   *
   * The generated public and secret key will be stored in passed in buffers.
   */
  export function crypto_vrf_keypair(publicKey: Buffer, secretKey: Buffer): void

  /**
   * Create a new keypair based on a seed.
   *
   * * `publicKey` should be a buffer with length `crypto_vrf_PUBLICKEYBYTES`.
   * * `secretKey` should be a buffer with length `crypto_vrf_SECRETKEYBYTES`.
   * * `seed` should be a buffer with length `crypto_vrf_SEEDBYTES`.
   *
   * The generated public and secret key will be stored in passed in buffers.
   */
  export function crypto_vrf_keypair_from_seed(publicKey: Buffer, secretKey: Buffer, seed: Buffer): void

  /**
   * Extract an ed25519 public key from an ed25519 secret key
   *
   * * `publicKey` should be a buffer with length `crypto_vrf_PUBLICKEYBYTES`.
   * * `secretKey` should be a buffer with length `crypto_vrf_SECRETKEYBYTES`.
   */
  export function crypto_vrf_sk_to_pk(publicKey: Buffer, secretKey: Buffer): void

  /**
   * Construct a VRF proof given a secret key and a message.
   *
   * * `proof` should be a buffer with length `crypto_vrf_PROOFBYTES`.
   * * `secretKey` should be a buffer with length `crypto_vrf_SECRETKEYBYTES`.
   * * `message` should be a buffer.
   *
   * The generated proof will be stored in passed in buffers.
   */
  export function crypto_vrf_prove(proof: Buffer, secretKey: Buffer, message: Buffer): void

  /**
   * Verify a VRF proof (for a given a public key and message) and validate the
   * public key. If verification succeeds, store the VRF output hash in output[].
   *
   * For a given public key and message, there are many possible proofs but only
   * one possible output hash.
   *
   * * `output` should be a buffer with length `crypto_vrf_OUTPUTBYTES`.
   * * `proof` should be a buffer with length `crypto_vrf_PROOFBYTES`.
   * * `publicKey` should be a buffer with length `crypto_vrf_publicBYTES`.
   * * `message` should be a buffer.
   *
   * The generated VRF ouput hash will be stored in passed in buffer.
   */
  export function crypto_vrf_verify(output: Buffer, publicKey: Buffer, proof: Buffer, message: Buffer): void

  /**
   * Convert a VRF proof pi into a VRF output hash beta per draft spec section 5.2.
   * This function does not verify the proof! For an untrusted proof, instead call
   * crypto_vrf_ietfdraft03_verify, which will output the hash if verification
   * succeeds.
   *
   * * `hash` should be a buffer with length `crypto_vrf_OUTPUTBYTES`.
   * * `proof` should be a buffer with length `crypto_vrf_PROOFBYTES`.
   *
   * The generated VRF ouput hash will be stored in passed in buffer.
   */
  export function crypto_vrf_proof_to_hash(hash: Buffer, proof: Buffer): void

  export function crypto_vrf_sk_to_seed(seed: Buffer, secretKey: Buffer): void

  export const crypto_vrf_PUBLICKEYBYTES: number
  export const crypto_vrf_SECRETKEYBYTES: number
  export const crypto_vrf_SEEDBYTES: number
  export const crypto_vrf_PROOFBYTES: number
  export const crypto_vrf_OUTPUTBYTES: number
}
