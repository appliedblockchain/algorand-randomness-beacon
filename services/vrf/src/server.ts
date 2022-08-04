import * as grpc from '@grpc/grpc-js'
import logger from './logger'
import { VrfHandlers } from './proto/vrf/Vrf'
import { VRFInput } from './proto/vrf/VRFInput'
import { VRFProof } from './proto/vrf/VRFProof'
import decryptVrfKey from './utils/kms'
import { vrfProve } from './utils/libsodium-wrapper'

const server: VrfHandlers = {
  GenerateProof: async (call: grpc.ServerUnaryCall<VRFInput, VRFProof>, callback: grpc.sendUnaryData<VRFProof>) => {
    const vrfInputString = Buffer.from(call.request.vrfInput).toString()
    try {
      logger.info('Generate proof handler', { vrfInputString })
      const vrfInputBuffer = Buffer.from(call.request.vrfInput)

      logger.info('Getting VRF key')
      const decryptedVrfKey = await decryptVrfKey()

      logger.info('Generating the proof')
      const proof = vrfProve(Buffer.from(decryptedVrfKey, 'hex'), vrfInputBuffer)

      logger.info('VRF proof generated', { proof: proof.toString('hex') })
      callback(null, { vrfProof: proof.toString('hex') })
    } catch (error) {
      logger.error(`Error generating VRF proof`, { vrfInputString, error })
      callback(new Error('Error generating proof'), null)
    }
  },
}

export default server
