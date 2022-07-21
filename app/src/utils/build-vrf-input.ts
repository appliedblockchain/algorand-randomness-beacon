import crypto from 'crypto'
const sha512 = crypto.createHash('sha512')

export default (blockNumber: number, blockSeed: string): string => {
  const toHash = blockNumber + blockSeed
  const data = sha512.update(toHash, 'utf-8')
  const hash = data.digest('hex')

  return hash
}
