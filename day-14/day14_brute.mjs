import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import {performance} from 'perf_hooks'
import ms from 'ms'

async function run(testMode) {
  const {polymer, rules} = await getPolymerData(testMode)
  console.log(polymer, rules)
  const newPolymer = doInsertions(polymer, rules, 40)
  const {minCount, maxCount} = getCount(newPolymer)
  console.log(`Max - Min: ${maxCount - minCount}`)
}

function getCount(polymer) {
  const counts = {}
  _.each(polymer, char => {
    counts[char] = (counts[char] || 0) + 1
  })
  let minCount = Number.MAX_SAFE_INTEGER
  let maxCount = 0
  _.each(counts, count => {
    if (count < minCount) {
      minCount = count
    }
    if (count > maxCount) {
      maxCount = count
    }
  })
  return {minCount, maxCount}
}


function doInsertions(polymer, rules, numSteps) {
  for (let i = 0; i < numSteps; i++) {
    const t0 = performance.now()
    polymer = doStep(polymer, rules)
    const t1 = performance.now()
    console.log(`After Step ${i + 1}: ${ms(Math.round(t1 - t0))}`)
  }
  return polymer
}

function doStep(polymer, rules) {
  const newPolymer = new Array(2 * polymer.length - 1)
  newPolymer[0] = polymer[0]
  for (let i = 0; i < polymer.length - 1; i++) {
    const str = polymer[i] + polymer[i + 1]
    if (rules[str]) {
      newPolymer[2 * i + 1] = rules[str]
      newPolymer[2 * (i + 1)] = polymer[i + 1]
      // newPolymer.push(rules[str], polymer[i + 1])
    } else {
      console.log(`MISSING RULE ${str}`)
    }
  }
  return newPolymer
}

async function getPolymerData(isTest) {
  let filename = isTest ? './day-14/dataTest.csv' : './day-14/data.csv'
  const lines = await getLines(filename)
  let polymer = ''
  const rules = {}
  _.each(lines, (line, index) => {
    if (index === 0) {
      polymer = line.split('')
    } else if (index > 1) {
      const [from, insert] = line.split(' -> ')
      rules[from] = insert
    }
  })
  return {polymer, rules}
}

export {run}