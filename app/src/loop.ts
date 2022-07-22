import { randomVrfInput } from './utils/build-vrf-input'
import { generateVrfKeyPair, vrfProofToHash, vrfProve } from './utils/libsodium-wrapper'

const oracleKeyPair = generateVrfKeyPair()

const BLOCK_AVERAGE = 300 // ms

const loop = () => {
  let blockNumber = 0
  setInterval(() => {
    blockNumber++
    console.log({ blockNumber })
    if (blockNumber % 8 !== 0) {
      return
    }
    const vrfInput = randomVrfInput(blockNumber)
    const proof = vrfProve(oracleKeyPair.sk, Buffer.from(vrfInput))
    const hash = vrfProofToHash(proof)
    console.log({ proof: proof.toString('hex'), hash: hash.toString('hex'), blockNumber })
  }, BLOCK_AVERAGE)
}

export default loop
