import crypto from 'crypto'

const buildVrfInput = (blockNumber: number, blockSeed: string): string => {
  const toHash = blockNumber + blockSeed
  const sha512 = crypto.createHash('sha512')
  const data = sha512.update(toHash, 'utf-8')
  const hash = data.digest('hex')

  return hash
}

export default buildVrfInput

export const randomVrfInput = (blockNumber?: number): string => {
  const randomBlockNumber = blockNumber || Math.floor(Math.random() * 10000000 + 22000000)
  const randomSeed = crypto.randomBytes(32).toString('hex')

  return buildVrfInput(randomBlockNumber, randomSeed)
}
