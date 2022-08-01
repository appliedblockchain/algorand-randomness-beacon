import 'dotenv/config'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { ProtoGrpcType } from './proto/vrf'

const PROTO_PATH = path.join(__dirname, './proto/vrf.proto')

import logger from './logger'
import handlers from './server'

const grpcAddress = `${process.env.GRPC_ADDRESS}:${process.env.GRPC_PORT}`

const startServer = () => {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH)
  const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType
  const server = new grpc.Server()
  server.addService(proto.vrf.Vrf.service, handlers)
  server.bindAsync(grpcAddress, grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) {
      throw error
    }
    server.start()
    logger.info(`gRPC listening on ${grpcAddress}`)
  })
}

startServer()
