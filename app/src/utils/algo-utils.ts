import algosdk from 'algosdk'

const client = new algosdk.Algodv2(process.env.ALGOD_TOKEN, process.env.ALGOD_SERVER, process.env.ALGOD_PORT)

export const getLastRound = async (): Promise<number> => {
  const status = await client.status().do()
  return status['last-round']
}

export const getBlockSeed = async (round: number): Promise<string> => {
  const block = await client.block(round).do()
  return block?.block?.seed?.toString('hex')
}
