import * as grpc from '@grpc/grpc-js'
import logger from './logger'
import { VrfHandlers } from './proto/vrf/Vrf'
import { VRFInput } from './proto/vrf/VRFInput'
import { VRFProof } from './proto/vrf/VRFProof'
import decryptVrfKey from './utils/kms'
import { vrfProofToHash, vrfProve } from './utils/libsodium-wrapper'

const server: VrfHandlers = {
  GenerateProof: async (call: grpc.ServerUnaryCall<VRFInput, VRFProof>, callback: grpc.sendUnaryData<VRFProof>) => {
    const vrfInputString = Buffer.from(call.request.vrfInput).toString()
    try {
      logger.info('Generating proof...', { vrfInputString })
      const vrfInputBuffer = Buffer.from(call.request.vrfInput)
      const decryptedVrfKey = await decryptVrfKey()
      const proof = vrfProve(Buffer.from(decryptedVrfKey, 'hex'), vrfInputBuffer)
      const proofHash = vrfProofToHash(proof)
      callback(null, { proofHash: proofHash.toString('hex') })
    } catch (error) {
      logger.error(`Error generating proof for vrfInputString`, { vrfInputString, error })
      callback(new Error('Error generating proof'), null)
    }
  },
}

export default server
