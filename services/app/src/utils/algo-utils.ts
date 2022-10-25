import algosdk from 'algosdk'
import fs from 'fs'
import { TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types'
import { join } from 'path'
import config from '../config'
import { randomUUID } from 'crypto'
const {
  algodPorts,
  algodServers,
  algodTokens,
  appCreatorAddress,
  appId,
  dummyAppId,
  vrfRoundMultiple,
  mostDistantRoundsAllowed,
  serviceMnemonic,
  numDummyTransactions,
} = config

export const algodClients = algodServers.map((algodServer, index) => {
  return { algodClient: new algosdk.Algodv2(algodTokens[index], algodServer, algodPorts[index]), algodServer }
})

const serviceAccount = algosdk.mnemonicToSecretKey(serviceMnemonic)
const signer = algosdk.makeBasicAccountTransactionSigner(serviceAccount)

const contractPath = join(__dirname, '../contract.json')
const contractBuff = fs.readFileSync(contractPath)
export const contract = new algosdk.ABIContract(JSON.parse(contractBuff.toString()))

export const getLastRound = async (client: algosdk.Algodv2): Promise<number> => {
  const status = await client.status().do()
  return status['last-round']
}

export const getBlockSeed = async (client: algosdk.Algodv2, round: number): Promise<string> => {
  const block = await client.block(round).do()
  return block?.block?.seed?.toString('hex')
}

export const getGlobalState = async (client: algosdk.Algodv2): Promise<TealKeyValue[]> => {
  const applicationInfoResponse = await client.accountApplicationInformation(appCreatorAddress, appId).do()
  return applicationInfoResponse['created-app']['global-state']
}

export const getValueFromKeyValue = (kv: TealKeyValue, decode = true) => {
  return {
    [1]: decode ? Buffer.from(kv.value.bytes, 'base64').toString() : Buffer.from(kv.value.bytes, 'base64'),
    [2]: kv.value.uint,
  }[Number(kv.value.type)]
}

export const getGlobalStateValue = async (
  client: algosdk.Algodv2,
  key: string,
): Promise<string | number | bigint | Buffer | undefined> => {
  const globalState = await getGlobalState(client)
  const base64Key = Buffer.from(key).toString('base64')
  const keyValue: TealKeyValue | undefined = globalState.find((kv) => kv.key === base64Key)
  if (!keyValue) {
    throw new Error('Key not found')
  }

  return getValueFromKeyValue(keyValue, false)
}

const encoder = new TextEncoder()

export const submitValue = async (
  client: algosdk.Algodv2,
  blockNumber: number,
  vrfOutput: Buffer,
): Promise<{
  confirmedRound: number
  txIDs: string[]
  methodResults: algosdk.ABIResult[]
}> => {
  const sp = await client.getTransactionParams().do()
  const comp = new algosdk.AtomicTransactionComposer()

  const timestamp = Date.now()
  const uuid = randomUUID()
  const note = encoder.encode(`${uuid}-${timestamp.toString()}`)
  sp.firstRound = blockNumber + 1
  sp.lastRound = sp.firstRound + 1000
  comp.addMethodCall({
    method: contract.getMethodByName('submit'),
    methodArgs: [blockNumber, vrfOutput],
    appID: appId,
    sender: serviceAccount.addr,
    suggestedParams: sp,
    signer,
    note,
  })

  for (let i = 0; i < numDummyTransactions; i++) {
    const dummyTxNote = encoder.encode(`${note}-${i}`)
    const txn = algosdk.makeApplicationNoOpTxn(serviceAccount.addr, sp, dummyAppId, [], [], [], [], dummyTxNote)
    comp.addTransaction({ txn, signer })
  }

  return comp.execute(client, 2)
}

/**
 *
 * @returns The last round accepted by the smart contract
 */
export const getLastRoundAcceptedBySC = async (client: algosdk.Algodv2): Promise<number | null> => {
  const lastSentRoundBuffer = (await getGlobalStateValue(client, '')) as Buffer
  const lastSentRoundHex = lastSentRoundBuffer.toString('hex', 0, 8)
  const lastSentRound = parseInt(lastSentRoundHex, 16)
  if (isNaN(lastSentRound)) {
    throw new Error('Invalid last sent round')
  }

  return lastSentRound
}

export const getNextExpectedRound = async (client: algosdk.Algodv2, lastRound: number): Promise<number | null> => {
  const lastRoundAcceptedBySC = await getLastRoundAcceptedBySC(client)

  const recoverUntilRound = lastRound - mostDistantRoundsAllowed
  if (lastRoundAcceptedBySC < recoverUntilRound) {
    // Disaster recovery
    return recoverUntilRound + vrfRoundMultiple - (recoverUntilRound % vrfRoundMultiple)
  }

  const nextExpectedRound = lastRoundAcceptedBySC + vrfRoundMultiple
  return nextExpectedRound
}
