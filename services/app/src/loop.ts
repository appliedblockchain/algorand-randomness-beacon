import * as Sentry from '@sentry/node'
import {
  getBlockSeed,
  getLastRound,
  getNextExpectedRound,
  getServiceAccountBalance,
  submitValue,
} from './utils/algo-utils'
import buildVrfInput from './utils/vrf'
import parentLogger from './logger'
import { getVrfProof } from './utils/grpc-client'
import { randomUUID } from 'crypto'
import tracer from './utils/tracer'

const serviceAccountMinimumBalance = parseInt(process.env.SERVICE_ACCOUNT_MINIMUM_BALANCE, 10)

const mainFlow = async () => {
  const span = tracer.startSpan('main-flow')
  const traceId = randomUUID()
  const logger = parentLogger.child({ traceId })
  try {
    const lastRound = await getLastRound()
    if (!lastRound) {
      throw new Error("can't get last round")
    }
    const nextExpectedRound = await getNextExpectedRound(lastRound)
    if (nextExpectedRound > lastRound) {
      span.addTags({ lastRound, nextExpectedRound, result: 'IGNORED' })
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
    const vrfProof = await getVrfProof(vrfInput, logger, traceId)
    logger.debug({ nextExpectedRound, blockSeed, vrfInput, vrfProof })

    try {
      logger.info('Submitting the proof', { vrfInput })
      const submitResult = await tracer.trace('submit', {}, () =>
        submitValue(nextExpectedRound, Buffer.alloc(80, vrfProof, 'hex'), logger),
      )
      const dataToLog = {
        txID: submitResult.txIDs[0],
        lastRound,
        submittedRound: nextExpectedRound,
        confirmedRound: submitResult.confirmedRound,
        blockSeed,
        vrfInput,
        vrfProof,
      }
      span.addTags({ ...dataToLog, result: 'SUBMITTED' })
      logger.debug('Proof submitted', dataToLog)
      const roundsAfter = submitResult.confirmedRound - nextExpectedRound
      if (roundsAfter > 3) {
        logger.warning('SLA not met', dataToLog)
        Sentry.captureException(new Error('Proof submitted outside SLA'), {
          extra: { ...dataToLog, roundsAfter },
        })
      }
    } catch (error) {
      span.addTags({ result: 'ERROR' })
      if (error?.response) {
        logger.error('Error submitting the proof', { statusCode: error.response.statusCode, body: error.response.body })
      } else {
        logger.error('Error submitting the proof', error)
      }
    }
  } catch (error) {
    span.setTag('result', 'ERROR')
    Sentry.captureException(error)
    logger.error(error)
  }
  span.finish()
}

export const serviceAccountBalanceAlert = async () => {
  const serviceAccountBalance = await getServiceAccountBalance()
  if (serviceAccountBalance < serviceAccountMinimumBalance) {
    Sentry.captureException(new Error('Insuficient service account balance'), {
      extra: { serviceAccountBalance, serviceAccountMinimumBalance },
    })
  }
}

const loop = async () => {
  setInterval(mainFlow, +process.env.MAIN_LOOP_INTERVAL)
  setInterval(serviceAccountBalanceAlert, +process.env.MAIN_LOOP_INTERVAL)
}

export default loop
