import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../proto/vrf'
import path from 'path'
import { promisify } from 'util'
import parentLogger from '../logger'
import { Logger } from 'winston'
import { VRFInput } from '../proto/vrf/VRFInput'

const PROTO_PATH = path.join(__dirname, '../proto/vrf.proto')
const packageDefinition = protoLoader.loadSync(PROTO_PATH)
const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType

const getDeadline = () => {
  return new Date(Date.now() + 5000)
}
const client = new proto.vrf.Vrf(process.env.VRF_GRPC_HOST as string, grpc.credentials.createInsecure())
const deadline = getDeadline()

client.waitForReady(deadline, (error?: Error) => {
  if (error) {
    parentLogger.error(`Client connect error: ${error.message}`)
  } else {
    parentLogger.info('gRPC client ready')
  }
})

const generateProof = promisify(client.generateProof.bind(client))

export const getVrfProof = async (vrfInput: string, logger: Logger, traceId: string): Promise<string | undefined> => {
  try {
    const metadata = new grpc.Metadata()
    metadata.add('trace-id', traceId)

    const result = await generateProof({ vrfInput } as VRFInput, metadata, { deadline: getDeadline() })
    return result.vrfProof
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export default client
