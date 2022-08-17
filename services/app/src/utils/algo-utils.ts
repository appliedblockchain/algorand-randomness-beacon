import algosdk from 'algosdk'
import fs from 'fs'
import { TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types'
import { Logger } from 'winston'
import { join } from 'path'
const {
  ALGOD_TOKEN,
  ALGOD_SERVER,
  APP_CREATOR_ADDRESS,
  ALGOD_PORT,
  BLOCK_INTERVAL,
  MOST_DISTANT_ROUNDS_ALLOWED,
  SERVICE_MNEMONIC,
  STARTING_ROUND,
} = process.env

export const client = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

const serviceAccount = algosdk.mnemonicToSecretKey(SERVICE_MNEMONIC)

const contractPath = join(__dirname, '../contract.json')
const contractBuff = fs.readFileSync(contractPath)
export const contract = new algosdk.ABIContract(JSON.parse(contractBuff.toString()))

export const getLastRound = async (): Promise<number> => {
  const status = await client.status().do()
  return status['last-round']
}

export const getBlockSeed = async (round: number): Promise<string> => {
  const block = await client.block(round).do()
  return block?.block?.seed?.toString('hex')
}

export const getGlobalState = async (): Promise<TealKeyValue[]> => {
  const applicationInfoResponse = await client
    .accountApplicationInformation(APP_CREATOR_ADDRESS as string, +process.env.APP_ID)
    .do()
  return applicationInfoResponse['created-app']['global-state']
}

export const getValueFromKeyValue = (kv: TealKeyValue, decode = true) => {
  return {
    [1]: decode ? Buffer.from(kv.value.bytes, 'base64').toString() : Buffer.from(kv.value.bytes, 'base64'),
    [2]: kv.value.uint,
  }[Number(kv.value.type)]
}

export const getGlobalStateValue = async (key: string): Promise<string | number | bigint | Buffer | undefined> => {
  const globalState = await getGlobalState()
  const base64Key = Buffer.from(key).toString('base64')
  const keyValue: TealKeyValue | undefined = globalState.find((kv) => kv.key === base64Key)
  if (!keyValue) {
    throw new Error('Key not found')
  }

  return getValueFromKeyValue(keyValue, false)
}

const executeAbiContract = async (
  method: string,
  methodArgs: algosdk.ABIArgument[],
  logger: Logger,
): Promise<{
  confirmedRound: number
  txIDs: string[]
  methodResults: algosdk.ABIResult[]
}> => {
  const appId = parseInt(process.env.APP_ID)

  const sp = await client.getTransactionParams().do()
  const comp = new algosdk.AtomicTransactionComposer()

  comp.addMethodCall({
    method: contract.getMethodByName(method),
    methodArgs,
    appID: appId,
    sender: serviceAccount.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(serviceAccount),
  })

  const results = await comp.execute(client, 2)
  for (const result of results.methodResults) {
    logger.debug(`${result.method.name} => ${result.returnValue}`)
  }
  return results
}

export const submitValue = async (blockNumber: number, vrfOutput: Buffer, logger: Logger) => {
  return await executeAbiContract('submit', [blockNumber, vrfOutput], logger)
}

/**
 *
 * @returns The last round accepted by the smart contract
 */
export const getLastRoundAcceptedBySC = async (): Promise<number | null> => {
  const lastSentRoundBuffer = (await getGlobalStateValue('')) as Buffer
  const lastSentRoundHex = lastSentRoundBuffer.toString('hex', 0, 8)
  const lastSentRound = parseInt(lastSentRoundHex, 16)
  if (isNaN(lastSentRound)) {
    throw new Error('Invalid last sent round')
  }

  return +lastSentRound
}

export const getNextExpectedRound = async (lastRound: number): Promise<number | null> => {
  const lastRoundAcceptedBySC = await getLastRoundAcceptedBySC()
  if (!lastRoundAcceptedBySC && +STARTING_ROUND <= lastRound) {
    // It's our first transaction
    return +STARTING_ROUND
  }

  if (+STARTING_ROUND > lastRound) {
    // We shouldn't start generating values yet
    return null
  }

  // There was a disaster. We will return the last block - (1000 - 8) nearest mod 8
  const recoverUntilRound = lastRound - +MOST_DISTANT_ROUNDS_ALLOWED

  // Closest valid round greater than the last round until when we can send the tx
  if (lastRoundAcceptedBySC < recoverUntilRound) {
    const closestValidRound = recoverUntilRound + +BLOCK_INTERVAL - (recoverUntilRound % +BLOCK_INTERVAL)
    return recoverUntilRound % +BLOCK_INTERVAL === 0 ? recoverUntilRound : closestValidRound
  }

  const nextExpectedRound = lastRoundAcceptedBySC + +BLOCK_INTERVAL
  return nextExpectedRound
}

export const getServiceAccountBalance = async (): Promise<number> => {
  const result = await client.accountInformation(serviceAccount.addr).do()

  return result.amount
}
