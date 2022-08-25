import algosdk from 'algosdk'
import fs from 'fs'
import { TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types'
import { join } from 'path'
import config from '../config'
const {
  algodToken,
  algodPort,
  algodServer,
  appCreatorAddress,
  appId,
  dummyAppId,
  vrfRoundMultiple,
  mostDistantRoundsAllowed,
  serviceMnemonic,
  vrfStartingRound,
  numDummyTransactions,
} = config

export const client = new algosdk.Algodv2(algodToken, algodServer, algodPort)

const serviceAccount = algosdk.mnemonicToSecretKey(serviceMnemonic)
const signer = algosdk.makeBasicAccountTransactionSigner(serviceAccount)

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
  const applicationInfoResponse = await client.accountApplicationInformation(appCreatorAddress, appId).do()
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

export const submitValue = async (
  blockNumber: number,
  vrfOutput: Buffer,
): Promise<{
  confirmedRound: number
  txIDs: string[]
  methodResults: algosdk.ABIResult[]
}> => {
  const sp = await client.getTransactionParams().do()
  const comp = new algosdk.AtomicTransactionComposer()

  sp.firstRound = blockNumber + 1
  sp.lastRound = sp.firstRound + 1000
  comp.addMethodCall({
    method: contract.getMethodByName('submit'),
    methodArgs: [blockNumber, vrfOutput],
    appID: appId,
    sender: serviceAccount.addr,
    suggestedParams: sp,
    signer,
  })

  for (let i = 0; i < numDummyTransactions; i++) {
    const txn = algosdk.makeApplicationNoOpTxn(serviceAccount.addr, sp, dummyAppId, [], [], [], [], new Uint8Array([i]))
    comp.addTransaction({ txn, signer })
  }

  return comp.execute(client, 2)
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

  return lastSentRound
}

export const getNextExpectedRound = async (lastRound: number): Promise<number | null> => {
  const lastRoundAcceptedBySC = await getLastRoundAcceptedBySC()
  if (!lastRoundAcceptedBySC && vrfStartingRound <= lastRound) {
    // It's our first transaction
    return vrfStartingRound
  }

  if (vrfStartingRound > lastRound) {
    // We shouldn't start generating values yet
    return null
  }

  const recoverUntilRound = lastRound - mostDistantRoundsAllowed
  if (lastRoundAcceptedBySC < recoverUntilRound) {
    return recoverUntilRound - (recoverUntilRound % 8)
  }

  const nextExpectedRound = lastRoundAcceptedBySC + vrfRoundMultiple
  return nextExpectedRound
}

export const getServiceAccountBalance = async (): Promise<number> => {
  const result = await client.accountInformation(serviceAccount.addr).do()

  return result.amount
}
