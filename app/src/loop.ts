import { getBlockSeed, getLastRound } from './utils/algo-utils'
import { vrfProofToHash, vrfProve } from './utils/libsodium-wrapper'
import { getOracleKeyPair } from './utils/oracle-key-pair'
import buildVrfInput from './utils/vrf'
import logger from './logger'
import { BLOCK_INTERVAL } from './constants'

const getProofHash = async (vrfInput: string): Promise<string> => {
  const oracleKeyPair = await getOracleKeyPair()
  const proof = vrfProve(oracleKeyPair.sk, Buffer.from(vrfInput))
  const hash = vrfProofToHash(proof)

  return hash.toString('hex')
}

const mainFlow = async () => {
  try {
    logger.info('Getting last round')
    const lastRound = await getLastRound()
    if (!lastRound) {
      throw new Error("can't get last round")
    }
    if (lastRound % BLOCK_INTERVAL !== 0) {
      logger.info('Ignoring last round', { lastRound })
      return
    }

    logger.info(`Getting block seed for ${lastRound}`)
    const blockSeed = await getBlockSeed(lastRound)
    if (!blockSeed) {
      throw new Error("can't get last round block seed")
    }

    logger.info('Building VRF input', { lastRound, blockSeed })
    const vrfInput = buildVrfInput(lastRound, blockSeed)
    logger.info('Getting the proof hash', { vrfInput })
    const hash = await getProofHash(vrfInput)
    logger.debug({ lastRound, blockSeed, vrfInput, hash })
  } catch (error) {
    logger.error(error)
  }
}

const loop = async () => {
  setInterval(mainFlow, 1000)
}

export default loop
