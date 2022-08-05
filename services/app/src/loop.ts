import * as Sentry from '@sentry/node'
import { getBlockSeed, getLastRound, getNextExpectedRound, submitValue } from './utils/algo-utils'
import buildVrfInput from './utils/vrf'
import parentLogger from './logger'
import { getVrfProof } from './utils/grpc-client'
import { randomUUID } from 'crypto'

const mainFlow = async () => {
  const logger = parentLogger.child({ traceId: randomUUID() })
  try {
    const lastRound = await getLastRound()
    if (!lastRound) {
      throw new Error("can't get last round")
    }
    const nextExpectedRound = await getNextExpectedRound(lastRound)
    if (nextExpectedRound > lastRound) {
      logger.info('Ignoring current round', { lastRound, nextExpectedRound })
      return
    }

    logger.info(`Getting block seed for ${nextExpectedRound}`)
    const blockSeed = await getBlockSeed(nextExpectedRound)
    if (!blockSeed) {
      throw new Error("can't get block seed")
    }

    logger.info('Building VRF input', { nextExpectedRound, blockSeed })
    const vrfInput = buildVrfInput(nextExpectedRound, blockSeed)

    logger.info('Getting the proof hash', { vrfInput })
    const vrfProof = await getVrfProof(vrfInput, logger)
    logger.debug({ nextExpectedRound, blockSeed, vrfInput, vrfProof })

    logger.info('Submiting the value', { vrfInput })
    const submitResult = await submitValue(nextExpectedRound, vrfProof, logger)

    logger.debug('Random value submitted', {
      nextExpectedRound,
      blockSeed,
      vrfInput,
      vrfProof,
      confirmedRound: submitResult.confirmedRound,
    })
  } catch (error) {
    Sentry.captureException(error)
    logger.error(error)
  }
}

const loop = async () => {
  setInterval(mainFlow, 1000)
}

export default loop
