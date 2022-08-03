import algosdk from 'algosdk'
import fs from 'fs'
import { TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types'

const client = new algosdk.Algodv2(process.env.ALGOD_TOKEN as string, process.env.ALGOD_SERVER, process.env.ALGOD_PORT)

const contractBuff = fs.readFileSync('../contract.json')
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

const getAccountsFromKmd = async (): Promise<algosdk.Account[]> => {
  const { KMD_TOKEN, KMD_HOST, KMD_PORT, KMD_WALLET, KMD_PASSWORD } = process.env
  const kmdClient = new algosdk.Kmd(KMD_TOKEN, KMD_HOST, KMD_PORT)

  const wallets = await kmdClient.listWallets()

  let walletId
  for (const wallet of wallets['wallets']) {
    if (wallet['name'] === KMD_WALLET) {
      walletId = wallet['id']
    }
  }

  if (walletId === undefined) {
    throw Error('No wallet named: ' + KMD_WALLET)
  }

  const handleResp = await kmdClient.initWalletHandle(walletId, KMD_PASSWORD)
  const handle = handleResp['wallet_handle_token']

  const addresses = await kmdClient.listKeys(handle)
  const acctPromises = []
  for (const addr of addresses['addresses']) {
    acctPromises.push(kmdClient.exportKey(handle, KMD_PASSWORD, addr))
  }
  const keys = await Promise.all(acctPromises)

  kmdClient.releaseWalletHandle(handle)

  return keys.map((k) => {
    const addr = algosdk.encodeAddress(k.private_key.slice(32))
    const acct = { sk: k.private_key, addr: addr } as algosdk.Account
    return acct
  })
}

const executeAbiContract = async (
  contractPath: string,
  method: string,
  methodArgs: algosdk.ABIArgument[],
  account?: algosdk.Account
) => {
  let acct
  if (!account) {
    // Get account from sandbox
    const accounts = await getAccountsFromKmd()
    acct = accounts[0]
  }

  // Read in the local contract.json file
  const buff = fs.readFileSync(contractPath)

  // Parse the json file into an object, pass it to create an ABIContract object
  const abiContract = new algosdk.ABIContract(JSON.parse(buff.toString()))

  const appId = parseInt(fs.readFileSync(process.env.APP_ID as string).toString())

  // We initialize the common parameters here, they'll be passed to all the transactions
  // since they happen to be the same
  const sp = await client.getTransactionParams().do()
  const commonParams = {
    appID: appId,
    sender: acct.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(acct)
  }

  const comp = new algosdk.AtomicTransactionComposer()

  // Simple ABI Calls with standard arguments, return type
  comp.addMethodCall({
    method: abiContract.getMethodByName(method),
    methodArgs,
    ...commonParams
  })

  // Finally, execute the composed group and print out the results
  const results = await comp.execute(client, 2)
  for (const result of results.methodResults) {
    console.log(`${result.method.name} => ${result.returnValue}`)
  }
}

export const submitValue = async (blockNumber: number, blockSeed: string, vrfOutput: string) => {
  await executeAbiContract('../contract.json', 'foo', [ 1 ])
}
