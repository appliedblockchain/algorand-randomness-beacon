import * as grpc from '@grpc/grpc-js'
import * as Sentry from '@sentry/node'
import { randomUUID } from 'crypto'
import parentLogger from './logger'
import { VrfHandlers } from './proto/vrf/Vrf'
import { VRFInput } from './proto/vrf/VRFInput'
import { VRFProof } from './proto/vrf/VRFProof'
import decryptVrfKey from './utils/kms'
import { vrfProve } from './utils/libsodium-wrapper'

const server: VrfHandlers = {
  GenerateProof: async (call: grpc.ServerUnaryCall<VRFInput, VRFProof>, callback: grpc.sendUnaryData<VRFProof>) => {
    const traceId = call.metadata.get('trace-id')[0]
    const logger = parentLogger.child({ traceId })
    const vrfInputString = Buffer.from(call.request.vrfInput, 'hex')
    try {
      logger.info('Generate proof handler', { vrfInput: call.request.vrfInput })
      const vrfInputBuffer = Buffer.from(call.request.vrfInput, 'hex')

      logger.info('Getting VRF key')
      const decryptedVrfKey = await decryptVrfKey()

      logger.info('Generating the proof')
      const proof = vrfProve(Buffer.from(decryptedVrfKey, 'hex'), vrfInputBuffer)

      logger.info('VRF proof generated', { proof: proof.toString('hex') })
      callback(null, { vrfProof: proof.toString('hex') })
    } catch (error) {
      Sentry.captureException(error)
      logger.error(`Error generating VRF proof`, { vrfInputString, error })
      callback(new Error('Error generating proof'), null)
    }
  },
}

export default server
