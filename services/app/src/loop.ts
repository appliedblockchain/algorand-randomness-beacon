import * as Sentry from '@sentry/node'
import { getBlockSeed, getLastRound } from './utils/algo-utils'
import buildVrfInput from './utils/vrf'
import logger from './logger'
import { BLOCK_INTERVAL } from './constants'
import { generateProof } from './utils/grpc-client'
import { VRFInput } from './proto/vrf/VRFInput'

const getVrfProof = async (vrfInput: string): Promise<string | undefined> => {
  try {
    const result = await generateProof({ vrfInput } as VRFInput)
    return result.vrfProof
  } catch (error) {
    logger.error(error)
  }
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
    const vrfProof = await getVrfProof(vrfInput)
    logger.debug({ lastRound, blockSeed, vrfInput, vrfProof })
  } catch (error) {
    Sentry.captureException(error)
    logger.error(error)
  }
}

const loop = async () => {
  setInterval(mainFlow, 1000)
}

export default loop
