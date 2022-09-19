import * as algoUtils from './algo-utils'

const { algodClient } = algoUtils.algodClients[0]
const getLastRoundAcceptedBySCMock = jest.spyOn(algoUtils, 'getLastRoundAcceptedBySC')

// Used while we not getting the last submitted round from the SC
const getLastRoundMock = jest.spyOn(algoUtils, 'getLastRound')
getLastRoundMock.mockReturnValue(Promise.resolve(null))

describe('algo-utils', () => {
  describe('getNextExpectedRound', () => {
    it('returns the next expected round (last sent + 8)', async () => {
      getLastRoundAcceptedBySCMock.mockReturnValueOnce(Promise.resolve(5000))
      expect(await algoUtils.getNextExpectedRound(algodClient, 5001)).toBe(5008)
    })

    describe('WHEN last accepted round is too far in the past (< LAST_ROUND - 1000 rounds)', () => {
      it('returns the most distant (984) accepted round if mod 8', async () => {
        getLastRoundAcceptedBySCMock.mockReturnValueOnce(Promise.resolve(5000))
        expect(await algoUtils.getNextExpectedRound(algodClient, 10000)).toBe(9016)
      })

      it('returns the nearest mod 8 round >= the most distant accepted round', async () => {
        getLastRoundAcceptedBySCMock.mockReturnValue(Promise.resolve(5000))
        expect(await algoUtils.getNextExpectedRound(algodClient, 10001)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10002)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10003)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10004)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10005)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10006)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10007)).toBe(9016)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10008)).toBe(9024)
        expect(await algoUtils.getNextExpectedRound(algodClient, 10009)).toBe(9024)
      })
    })
  })
})
