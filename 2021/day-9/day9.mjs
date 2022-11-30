import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const heightMap = await getHeightMap(testMode)
  const riskSum = getRiskSum(heightMap)
  console.log(`Risk: ${riskSum}`)
  console.log(`BasinScore: ${getBasinScore(heightMap)}`)

}

function getRiskSum(heightMap) {
  let riskSum = 0
  for (let row = 0; row < heightMap.length; row++) {
    const rowData = heightMap[row]
    for (let col = 0; col < rowData.length; col++) {
      const value = rowData[col]
      const up = row > 0 ? heightMap[row - 1][col] : Number.MAX_SAFE_INTEGER
      const down = row < heightMap.length - 1 ? heightMap[row + 1][col] : Number.MAX_SAFE_INTEGER
      const left = col > 0 ? rowData[col - 1] : Number.MAX_SAFE_INTEGER
      const right = col < rowData.length - 1 ? rowData[col + 1] : Number.MAX_SAFE_INTEGER
      if (value < up && value < down && value < left && value < right) {
        riskSum += value + 1
      }
    }
  }
  return riskSum
}

function getBasinScore(heightMap) {
  let checkedPoints = {}
  let basinTopScores = [1, 1, 1]
  _.each(heightMap, (rowData, row) => {
    _.each(rowData, (colValue, col) => {
      const checkStr = getCheckStr(row, col)
      if (!checkedPoints[checkStr] && colValue < 9) {
        let pointsInBasin = addToBasin(heightMap, row, col, {})
        let numPoints = pointsInBasin.length
        // console.log(numPoints, pointsInBasin)
        if (basinTopScores[0] < numPoints) {
          basinTopScores[0] = numPoints
          basinTopScores.sort((a, b) => a - b)
        }
        _.each(pointsInBasin, point => checkedPoints[point] = true)
      }
      checkedPoints[checkStr] = true
    })
  })
  return basinTopScores[0] * basinTopScores[1] * basinTopScores[2]
}

function getCheckStr(row, col) {
  return `${row}_${col}`
}

function addToBasin(heightMap, row = 0, col = 0, basin = {}) {
  let value = heightMap?.[row]?.[col]
  const checkStr = getCheckStr(row, col)
  if (value != null && value < 9 && !basin[checkStr]) {
    basin[checkStr] = true
    addToBasin(heightMap, row - 1, col, basin)
    addToBasin(heightMap, row + 1, col, basin)
    addToBasin(heightMap, row, col - 1, basin)
    addToBasin(heightMap, row, col + 1, basin)
  }
  return _.keys(basin)
}

async function getHeightMap(isTest) {
  let filename = isTest ? './day-9/heightMapTest.csv' : './day-9/heightMap.csv'
  const lines = await getLines(filename)
  return _.map(lines, line => {
    return line.split('').map(n => Number(n))
  })
}

export {run}