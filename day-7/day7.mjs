import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import {mean, median} from 'simple-statistics'


async function run(testMode) {
  const useFast = true
  const crabPositions = await getCrabPositions(testMode)
  let leastFuel = getLeastFuel(_.cloneDeep(crabPositions), false, useFast)
  console.log(`Least Fuel Spent (Linear): ${leastFuel}`)
  leastFuel = getLeastFuel(_.cloneDeep(crabPositions), true, useFast)
  console.log(`Least Fuel Spent (Exp): ${leastFuel}`)
}

function getLeastFuel(crabPositions, useExponentialFuel = false, useFast = false) {
  let crabsAtPosition = []
  _.each(crabPositions, position => {
    crabsAtPosition[position] = (crabsAtPosition[position] || 0) + 1
  })
  if (useFast) {
    return useFastSolution(crabPositions, crabsAtPosition, useExponentialFuel)
  }
  return useSlowSolution(crabsAtPosition, useExponentialFuel)

}

function useFastSolution(crabPositions, crabsAtPosition, useExponentialFuel) {
  // I think O(NlogN) solution ish??
  // starts at the median or mean depending on whether using the exponential fuel usage for part 1 vs 2.
  let startingPoint = Math.round(useExponentialFuel ? mean(crabPositions) : median(crabPositions))
  let lowestScore = null
  // don't start at 0 as starting point used for upper bound starting point.
  if (startingPoint === 0) {
    startingPoint = 1
  }
  let lower = startingPoint - 1, upper = startingPoint
  let maxPosition = crabsAtPosition.length + 1
  for (; lower >= 0 || upper < maxPosition - 1; lower--, upper++) {
    if (lower >= 0) {
      const score = getScore(crabsAtPosition, lower, lowestScore, useExponentialFuel)
      if (lowestScore == null || lowestScore > score) {
        lowestScore = score
      } else {
        // beyond the lowest score and as this will be a V shaped for finding the lowest
        // i.e. move further away it will just get worse, can stop calculating
        lower = -1
      }
    }
    if (upper < maxPosition - 1) {
      const score = getScore(crabsAtPosition, upper, lowestScore, useExponentialFuel)
      if (lowestScore == null || lowestScore > score) {
        lowestScore = score
      } else {
        // beyond the lowest score and as this will be a V shaped for finding the lowest
        // i.e. move further away it will just get worse, can stop calculating
        upper = maxPosition
      }
    }
  }
  return lowestScore
}

function useSlowSolution(crabsAtPosition, useExponentialFuel) {
  // O(N^2) solution ish
  // uses a naive algorithm getting hte score at every position but
  let lowestScore = null
  _.each(crabsAtPosition, (count, position) => {
    const score = getScore(crabsAtPosition, position, lowestScore, useExponentialFuel)
    if (lowestScore == null || lowestScore > score) {
      lowestScore = score
    }
  })
  return lowestScore
}

function getScore(crabsAtPosition, position, lowestScore = null, useExponentialFuel = false) {
  let score = 0
  _.each(crabsAtPosition, (count2, position2) => {
    let dist = Math.abs(position - position2)
    if (dist === 0) {
      return
    }
    let numCrabs = count2 || 0
    if (useExponentialFuel) {
      score += (dist * (dist + 1)) / 2 * numCrabs
    } else {
      score += dist * numCrabs
    }
    if (lowestScore != null && score > lowestScore) {
      return false // this is not the lowest score.
    }
  })
  return score
}

async function getCrabPositions(isTest) {
  let filename = isTest ? './day-7/crabPositionsTest.csv' : './day-7/crabPositions.csv'
  const lines = await getLines(filename)
  // get the line segments
  return lines[0].split(',').map(num => Number(num))
}

export {run}