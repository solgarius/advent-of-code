import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const {points, folds} = await getPointsAndFolds(testMode)
  console.log(points, folds)
  doFolds(points, folds)
}

function doFolds(points, folds) {
  const allPoints = {}
  _.each(points, point => {
    allPoints[pointAsStr(point)] = point
  })
  _.each(folds, fold => {
    const index = fold[0] === 'x' ? 0 : 1
    const foldLine = fold[1]
    _.each(points, point => {
      const str = pointAsStr(point)
      if (point[index] === foldLine) {
        delete allPoints[str]
      } else if (point[index] > foldLine) {
        delete allPoints[str]
        const newPoint = _.cloneDeep(point)
        newPoint[index] = foldLine - (newPoint[index] - foldLine)
        allPoints[pointAsStr(newPoint)] = newPoint
      }
    })
    points = _.values(allPoints)
    console.log(points.length)
  })
  let maxY = 0
  let maxX = 0
  _.each(points, point => {
    if (point[0] > maxX) {
      maxX = point[0]
    }
    if (point[1] > maxY) {
      maxY = point[1]
    }
  })
  console.log(maxX, maxY)
  let str = ''
  for (let y = 0; y < maxY + 1; y++) {
    for (let x = 0; x < maxX + 1; x++) {
      if (allPoints[pointAsStr([x, y])]) {
        str += '#'
      } else {
        str += '.'
      }
    }
    str += '\n'
  }
  console.log(str)
}

function pointAsStr(point) {
  return `${point[0]}_${point[1]}`
}

async function getPointsAndFolds(isTest) {
  let filename = isTest ? './day-13/foldInstructionsTest.csv' : './day-13/foldInstructions.csv'
  const lines = await getLines(filename)
  const points = []
  const folds = []
  _.each(lines, line => {
    if (line.match(/^\d/)) {
      // starts with number
      points.push(line.split(',').map(n => Number(n)))
    } else if (line.match(/^fold/)) {
      // fold
      const split = line.split(' ')
      const fold = split[2]
      const splitFold = fold.split('=')
      splitFold[1] = Number(splitFold[1])
      folds.push(splitFold)
    }
  })
  return {points, folds}
}

export {run}