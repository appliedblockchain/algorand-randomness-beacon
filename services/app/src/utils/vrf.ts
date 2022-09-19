import crypto from 'crypto'

const buildVrfInput = (blockNumber: number, blockSeed: string): string => {
  const blockNumberToHash = blockNumber.toString(16).padStart(16, '0')
  const toHash = blockNumberToHash + blockSeed
  const sha512 = crypto.createHash('sha512-256')
  const data = sha512.update(toHash, 'hex')
  const hash = data.digest('hex')

  return hash
}

export default buildVrfInput

// Block seed for local network
export const randomBlockSeed = (): string => crypto.randomBytes(32).toString('hex')

export const randomVrfInput = (blockNumber?: number): string => {
  const randomBlockNumber = blockNumber || Math.floor(Math.random() * 10000000 + 22000000)
  const randomSeed = randomBlockSeed()

  return buildVrfInput(randomBlockNumber, randomSeed)
}
