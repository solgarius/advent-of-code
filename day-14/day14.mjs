import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const {polymer, rules} = await getPolymerData(testMode)
  const polymerByPairs1 = doInsertions(polymer, rules, 10)
  const count1 = getCount(polymer, polymerByPairs1)
  console.log(`Max - Min: ${count1.maxCount - count1.minCount}`)
  const polymerByPairs2 = doInsertions(polymer, rules, 40)
  const count2 = getCount(polymer, polymerByPairs2)
  console.log(`Max - Min: ${count2.maxCount - count2.minCount}`)
}

function toPairs(polymer) {
  const polymerByPairs = {}
  for (let i = 0; i < polymer.length - 1; i++) {
    const str = polymer[i] + polymer[i + 1]
    polymerByPairs[str] = (polymerByPairs[str] || 0) + 1
  }
  return polymerByPairs
}

function doInsertions(polymer, rules, numSteps) {
  const polymerByPairs = toPairs(polymer)

  for (let i = 0; i < numSteps; i++) {
    doStep(polymerByPairs, rules)
  }
  return polymerByPairs
}

function getCount(originalPolymer, polymerByPairs) {
  const counts = {}
  const char = originalPolymer[0]
  counts[char] = 1
  _.each(polymerByPairs, (count, pair) => {
    const char = pair.charAt(1)
    counts[char] = (counts[char] || 0) + count
  })
  // console.log(counts)
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


function doStep(polymerByPairs, rules) {
  // console.log('doStep', polymerByPairs)
  const oldPolymerByPairs = _.cloneDeep(polymerByPairs)
  const addedPairs = {}
  const removedPairs = {}
  _.each(oldPolymerByPairs, (count, pair) => {
    // split the pair
    if (rules[pair] && count > 0) {
      const newPair1 = pair.charAt(0) + rules[pair]
      const newPair2 = rules[pair] + pair.charAt(1)
      removedPairs[pair] = (removedPairs[pair] || 0) + count
      addedPairs[newPair1] = (addedPairs[newPair1] || 0) + count
      addedPairs[newPair2] = (addedPairs[newPair2] || 0) + count
      // console.log('doStep', pair, rules[pair], polymerByPairs)
    }
  })
  _.each(addedPairs, (count, key) => {
    polymerByPairs[key] = (polymerByPairs[key] || 0) + count
  })
  _.each(removedPairs, (count, key) => {
    polymerByPairs[key] = (polymerByPairs[key] || 0) - count
  })
  // console.log('doneStep', polymerByPairs)
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