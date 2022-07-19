import 'dotenv/config'
import algosdk from 'algosdk'

const client = new algosdk.Algodv2(process.env.ALGOD_TOKEN, process.env.ALGOD_SERVER, process.env.ALGOD_PORT)

;(async () => {
  const status = await client.status().do()
  const lastRound = status['last-round']
  const block = await client.block(lastRound).do()
  console.log({ status, block })
})().catch((e) => {
  console.log(e)
})
