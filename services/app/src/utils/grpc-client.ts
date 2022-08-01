import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../proto/vrf'
import path from 'path'
import { promisify } from 'util'
import logger from '../logger'

const PROTO_PATH = path.join(__dirname, '../proto/vrf.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH)
const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType
const client = new proto.vrf.Vrf(process.env.VRF_GRPC_HOST as string, grpc.credentials.createInsecure())
const deadline = new Date()
deadline.setSeconds(deadline.getSeconds() + 10)

client.waitForReady(deadline, (error?: Error) => {
  if (error) {
    logger.error(`Client connect error: ${error.message}`)
  } else {
    logger.info('gRPC client ready')
  }
})

export const generateProof = promisify(client.generateProof.bind(client))

export default client
