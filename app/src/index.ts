import algosdk from 'algosdk'

const token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const server = 'http://127.0.0.1'
const port = 4001
const client = new algosdk.Algodv2(token, server, port)

;(async () => {
  console.log('Status: ')
  console.log(await client.status().do())
})().catch((e) => {
  console.log(e)
})
const b = {g: 9}
