import buildVrfInput from './build-vrf-input'

describe('buildVrfInput', () => {
  it('builds VRF input', () => {
    const vrfInput = buildVrfInput(1, 'seed')
    expect(vrfInput).toBeTruthy()
  })
})
