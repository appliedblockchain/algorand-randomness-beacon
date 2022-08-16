import './utils/tracer'
import 'dotenv/config'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as Sentry from '@sentry/node'
import path from 'path'
import { ProtoGrpcType } from './proto/vrf'
import logger from './logger'
import handlers from './server'

Sentry.init({
  environment: process.env.NODE_ENV,
})

const PROTO_PATH = path.join(__dirname, './proto/vrf.proto')

const grpcAddress = `${process.env.GRPC_ADDRESS}:${process.env.GRPC_PORT}`

const startServer = () => {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH)
  const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType
  const server = new grpc.Server()
  server.addService(proto.vrf.Vrf.service, handlers)
  server.bindAsync(grpcAddress, grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) {
      Sentry.captureException(error)
      throw error
    }
    server.start()
    logger.info(`gRPC listening on ${grpcAddress}`)
  })
}

startServer()
