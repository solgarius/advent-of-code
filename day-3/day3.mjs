import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const diagnostics = testMode ? await getTestDiagnosticReport() : await getDiagnosticReport()
  let {epsilon, gamma} = await runEpsilonGamma(diagnostics)
  console.log(`epsilon ${epsilon}, gamma ${gamma}, power consumption: ${gamma * epsilon}`)
  const {oxygenGeneratorRating, co2ScrubberRating} = await runLifeSupportRating(diagnostics)
  console.log(`Oxygen Rating ${oxygenGeneratorRating} CO2 Rating ${co2ScrubberRating}, mul: ${oxygenGeneratorRating * co2ScrubberRating}`)
}

async function runEpsilonGamma(diagnostics = [{line: [0]}]) {
  let epsilonArr = []
  let gammaArr = []
  let greaterThanCount = []
  for (const diagnostic of diagnostics) {
    const {line = [0]} = diagnostic || {}
    if (line && line.length > 0) {
      for (let i = 0; i < line.length; i++) {
        if (greaterThanCount.length <= i) {
          greaterThanCount.push(0)
        }
        if (line[i] === 1) {
          greaterThanCount[i]++
        } else if (line[i] === 0) {
          greaterThanCount[i]--
        }
      }
    }
  }
  for (const countVal of greaterThanCount) {
    if (countVal > 0) {
      epsilonArr.push(1)
      gammaArr.push(0)
    } else {
      epsilonArr.push(0)
      gammaArr.push(1)
    }
  }
  console.log(greaterThanCount, epsilonArr, gammaArr)
  return {
    epsilon: Number.parseInt(epsilonArr.join(''), 2),
    gamma: Number.parseInt(gammaArr.join(''), 2)
  }
}

function filterAtIndex(diagnostics = [{line: [0]}], mostCommon = true, index = 0) {
  let greaterThanCount = 0
  for (const diagnostic of diagnostics) {
    const {line = [0]} = diagnostic || {}
    if (line && line.length > index) {
      if (line[index] === 1) {
        greaterThanCount++
      } else if (line[index] === 0) {
        greaterThanCount--
      }
    }
  }
  let lookingFor = 0
  if ((mostCommon && greaterThanCount >= 0) || (!mostCommon && greaterThanCount < 0)) {
    lookingFor = 1
  }
  return _.filter(diagnostics, (diagnostic) => {
    const value = diagnostic?.line?.[index] || 0
    return value === lookingFor || false
  })
}

async function runLifeSupportRating(diagnostics = [{line: [0]}]) {
  let mostCommonArr = _.cloneDeep(diagnostics)
  let leastCommonArr = _.cloneDeep(diagnostics)
  let index = 0
  while (mostCommonArr.length > 1) {
    let newMostCommonArr = filterAtIndex(mostCommonArr, true, index)
    mostCommonArr = newMostCommonArr.length > 0 ? newMostCommonArr : [mostCommonArr[0]]
    index++
  }
  index = 0
  while (leastCommonArr.length > 1) {
    let newLeastCommonArr = filterAtIndex(leastCommonArr, false, index)
    leastCommonArr = newLeastCommonArr.length > 0 ? newLeastCommonArr : [leastCommonArr[0]]
    index++
  }
  if (mostCommonArr.length === 0) {
    mostCommonArr[0] = {line: [0]}
  }
  if (leastCommonArr.length === 0) {
    leastCommonArr[0] = {line: [0]}
  }
  const mostCommon = mostCommonArr[0].line
  const leastCommon = leastCommonArr[0].line
  console.log(mostCommon, leastCommon)
  return {
    oxygenGeneratorRating: Number.parseInt(mostCommon.join(''), 2),
    co2ScrubberRating: Number.parseInt(leastCommon.join(''), 2)
  }
}

async function getTestDiagnosticReport() {
  return getDiagnosticsFromLines([
    '00100',
    '11110',
    '10110',
    '10111',
    '10101',
    '01111',
    '00111',
    '11100',
    '10000',
    '11001',
    '00010',
    '01010'
  ])
}

async function getDiagnosticReport() {
  const lines = await getLines('./day-3/diagnostics.csv')
  return getDiagnosticsFromLines(lines)
}

function getDiagnosticsFromLines(lines = ['']) {
  let diagnostics = []
  for (const line of lines) {
    try {
      if (line != null && line !== '') {
        let lineArr = line.split('').map(char => Number(char))
        diagnostics.push({line: lineArr})
      }
    } catch (e) {
    }
  }
  return diagnostics
}

export {run}