const algodTokens = process.env.ALGOD_TOKENS.split(',')
const algodServers = process.env.ALGOD_SERVERS.split(',')
const algodPorts = process.env.ALGOD_PORTS.split(',')

const config = {
  algodTokens,
  algodServers,
  algodPorts,
  appCreatorAddress: process.env.APP_CREATOR_ADDRESS,
  appId: parseInt(process.env.APP_ID, 10),
  dummyAppId: parseInt(process.env.DUMMY_APP_ID, 10),
  vrfGrpcHost: process.env.VRF_GRPC_HOST,
  serviceMnemonic: process.env.SERVICE_MNEMONIC,
  mostDistantRoundsAllowed: parseInt(process.env.MOST_DISTANT_ROUNDS_ALLOWED, 10),
  vrfRoundMultiple: parseInt(process.env.VRF_ROUND_MULTIPLE, 10),
  mainLoopInterval: parseInt(process.env.MAIN_LOOP_INTERVAL, 10),
  numDummyTransactions: parseInt(process.env.NUMBER_OF_DUMMY_TRANSACTIONS),
  submittedAfterThreshold: parseInt(process.env.SUBMITTED_AFTER_THRESHOLD, 10),
}

export default config
