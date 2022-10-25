import * as Sentry from '@sentry/node'
import { algodClients, getBlockSeed, getLastRound, getNextExpectedRound, submitValue } from './utils/algo-utils'
import buildVrfInput from './utils/vrf'
import parentLogger from './logger'
import { getVrfProof } from './utils/grpc-client'
import { randomUUID } from 'crypto'
import tracer from './utils/tracer'
import config from './config'
import { Algodv2 } from 'algosdk'
const { mainLoopInterval } = config

const mainFlow = async (client: Algodv2, algodServer: string) => {
  const span = tracer.startSpan('main-flow')
  const traceId = randomUUID()
  const logger = parentLogger.child({ traceId, algodServer })
  try {
    const lastRound = await getLastRound(client)
    if (!lastRound) {
      throw new Error("can't get last round")
    }
    const nextExpectedRound = await getNextExpectedRound(client, lastRound)
    if (nextExpectedRound > lastRound) {
      span.addTags({ lastRound, nextExpectedRound, result: 'IGNORED' })
      logger.info('Ignoring current round', { lastRound, nextExpectedRound })
      return
    }

    logger.info(`Getting block seed for ${nextExpectedRound}`)
    const blockSeed = await getBlockSeed(client, nextExpectedRound)
    if (!blockSeed) {
      throw new Error("can't get block seed")
    }

    logger.info('Building VRF input', { nextExpectedRound, blockSeed })
    const vrfInput = buildVrfInput(nextExpectedRound, blockSeed)

    logger.info('Getting the proof', { vrfInput })
    const vrfProof = await getVrfProof(vrfInput, logger, traceId)
    logger.debug({ lastRound, nextExpectedRound, blockSeed, vrfInput, vrfProof })

    try {
      logger.info('Submitting the proof', { vrfInput })
      const submitResult = await tracer.trace('submit', {}, () =>
        submitValue(client, nextExpectedRound, Buffer.from(vrfProof, 'hex')),
      )
      const roundsAfter = submitResult.confirmedRound - nextExpectedRound
      const metSLA = roundsAfter > config.submittedAfterThreshold
      const dataToLog = {
        txID: submitResult.txIDs[0],
        lastRound,
        submittedRound: nextExpectedRound,
        confirmedRound: submitResult.confirmedRound,
        blockSeed,
        vrfInput,
        vrfProof,
        submittedAfterNumRounds: roundsAfter,
        SLA: metSLA ? 'MET' : 'NOT_MET',
      }

      logger.debug('Proof submitted', dataToLog)
      span.addTags({ ...dataToLog, algodServer, result: 'SUBMITTED' })
      if (!metSLA) {
        Sentry.captureException(new Error('Proof submitted outside SLA'), {
          extra: { ...dataToLog, roundsAfter },
        })
      }
    } catch (error) {
      span.addTags({ result: 'ERROR' })
      if (error?.response) {
        logger.error('Error submitting the proof', {
          statusCode: error.response.statusCode,
          body: error.response.body,
          lastRound,
          submittedRound: nextExpectedRound,
        })
      } else {
        logger.error(error)
        logger.error('Error submitting the proof', { lastRound, submittedRound: nextExpectedRound })
      }
    }
  } catch (error) {
    span.setTag('result', 'ERROR')
    Sentry.captureException(error)
    logger.error(error)
  }
  span.finish()
}

const loop = async () => {
  for (const { algodClient, algodServer } of algodClients) {
    setInterval(() => mainFlow(algodClient, algodServer), mainLoopInterval)
  }
}

export default loop
