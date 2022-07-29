import buildVrfInput, { randomBlockSeed, randomVrfInput } from './vrf'

describe('VRF Utils', () => {
  describe('buildVrfInput()', () => {
    it('builds VRF input', () => {
      const vrfInput = buildVrfInput(1, 'seed')
      expect(vrfInput).toBeTruthy()
    })
  })

  describe('randomBlockSeed()', () => {
    it('generates random block seed', () => {
      const seed = randomBlockSeed()
      expect(seed.length).toBe(64)
    })
  })

  describe('randomVrfInput()', () => {
    it('generates random block seed', () => {
      const input = randomVrfInput()
      expect(input).toBeTruthy()
    })
  })
})
