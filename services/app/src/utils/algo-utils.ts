import algosdk from 'algosdk'
import fs from 'fs'
import { TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types'

const client = new algosdk.Algodv2(process.env.ALGOD_TOKEN as string, process.env.ALGOD_SERVER, process.env.ALGOD_PORT)

const contractPath = '../contract.json'
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
    .accountApplicationInformation(process.env.APP_CREATOR_ADDRESS as string, Number(process.env.APP_ID as string))
    .do()
  return applicationInfoResponse['created-app']['global-state']
}

export const getValueFromKeyValue = (kv: TealKeyValue, decode = true) => {
  return {
    [1]: decode ? Buffer.from(kv.value.bytes, 'base64').toString() : Buffer.from(kv.value.bytes, 'base64'),
    [2]: kv.value.uint
  }[Number(kv.value.type)]
}

export const getGlobalStateValue = async (key: string): Promise<string | number | bigint | Buffer | undefined> => {
  const globalState = await getGlobalState()
  const base64Key = Buffer.from(key).toString('base64')
  const keyValue: TealKeyValue | undefined = globalState.find((kv) => kv.key === base64Key)
  if (!keyValue) {
    throw new Error('Key not found')
  }

  return getValueFromKeyValue(keyValue)
}

const getServiceAccount = async (): Promise<algosdk.Account> => {
  const { SERVICE_PRIVATE_KEY, SERVICE_ADDRESS } = process.env
  return {
    sk: new Uint8Array(Buffer.from(SERVICE_PRIVATE_KEY as string, 'hex')),
    addr: SERVICE_ADDRESS,
  }
}

const executeAbiContract = async (method: string, methodArgs: algosdk.ABIArgument[]) => {
  // Get account from sandbox
  const serviceAccount = await getServiceAccount()

  const appId = parseInt(fs.readFileSync(process.env.APP_ID as string).toString())

  // We initialize the common parameters here, they'll be passed to all the transactions
  // since they happen to be the same
  const sp = await client.getTransactionParams().do()
  const commonParams = {
    appID: appId,
    sender: serviceAccount.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(serviceAccount),
  }

  const comp = new algosdk.AtomicTransactionComposer()

  // Simple ABI Calls with standard arguments, return type
  comp.addMethodCall({
    method: contract.getMethodByName(method),
    methodArgs,
    ...commonParams,
  })

  // Finally, execute the composed group and print out the results
  const results = await comp.execute(client, 2)
  for (const result of results.methodResults) {
    console.log(`${result.method.name} => ${result.returnValue}`)
  }
  return results
}

export const submitValue = async (blockNumber: number, blockSeed: string, vrfOutput: string) => {
  await executeAbiContract('submit', [1])
}
