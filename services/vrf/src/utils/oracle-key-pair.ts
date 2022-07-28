import { KeyPair } from '../types'
import { vrfSkToPk } from './libsodium-wrapper'

// Cache decrypted oracle KeyPair
let oracleKeyPair: KeyPair = null
export const getOracleKeyPair = async (): Promise<KeyPair> => {
  if (oracleKeyPair) {
    return oracleKeyPair
  }

  // TODO: KMS decrypt
  const decryptedOracleSk = process.env.ORACLE_SECRET_KEY
  const skpk = Buffer.from(decryptedOracleSk, 'hex')
  const pk = vrfSkToPk(skpk)

  return { sk: skpk, pk }
}

// Get the Oracle key pair immediately
getOracleKeyPair()
