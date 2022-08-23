import * as algoUtils from './algo-utils'

const getLastRoundAcceptedBySCMock = jest.spyOn(algoUtils, 'getLastRoundAcceptedBySC')

// Used while we not getting the last submitted round from the SC
const getLastRoundMock = jest.spyOn(algoUtils, 'getLastRound')
getLastRoundMock.mockReturnValue(Promise.resolve(null))

describe('algo-utils', () => {
  describe('getNextExpectedRound', () => {
    it('returns null if lastRound is less than the starting round', async () => {
      getLastRoundAcceptedBySCMock.mockReturnValueOnce(Promise.resolve(null))
      expect(await algoUtils.getNextExpectedRound(4000)).toBe(null)
    })

    it('returns the STARTING_ROUND if the SC has no values and last round is at least the starting round', async () => {
      getLastRoundAcceptedBySCMock.mockReturnValueOnce(Promise.resolve(null))
      expect(await algoUtils.getNextExpectedRound(5001)).toBe(5000)
    })

    it('returns the next expected round (last sent + 8)', async () => {
      getLastRoundAcceptedBySCMock.mockReturnValueOnce(Promise.resolve(5000))
      expect(await algoUtils.getNextExpectedRound(5001)).toBe(5008)
    })

    describe('WHEN last accepted round is too far in the past (< LAST_ROUND - 1000 rounds)', () => {
      it('returns the most distant accepted round if mod 8', async () => {
        getLastRoundAcceptedBySCMock.mockReturnValueOnce(Promise.resolve(5000))
        expect(await algoUtils.getNextExpectedRound(10000)).toBe(9016)
      })

      it('returns the nearest mod 8 round less than the most distant accepted round', async () => {
        getLastRoundAcceptedBySCMock.mockReturnValue(Promise.resolve(5000))
        expect(await algoUtils.getNextExpectedRound(10001)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10002)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10003)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10004)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10005)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10006)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10007)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(10008)).toBe(9024)
        expect(await algoUtils.getNextExpectedRound(10009)).toBe(9024)
      })
    })
  })
})
