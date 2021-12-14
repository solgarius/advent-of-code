import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import {performance} from 'perf_hooks'
import ms from 'ms'

async function run(testMode) {
  const CHUNK_SIZE = 4
  const {polymer, rules} = await getPolymerData(testMode)
  const chunkedPolymer = {}
  addChunks(chunkedPolymer, polymer, CHUNK_SIZE)
  console.log(chunkedPolymer, rules)
  const newPolymer = doInsertions(chunkedPolymer, rules, 10, CHUNK_SIZE)
  console.log(newPolymer)
  const {minCount, maxCount} = getCount(newPolymer)
  console.log(`Max - Min: ${maxCount - minCount}`)
}

function doInsertions(chunkedPolymer, rules, numSteps, chunkSize = 4) {
  for (let i = 0; i < numSteps; i++) {
    const t0 = performance.now()
    doStep(chunkedPolymer, rules, chunkSize)
    const t1 = performance.now()
    console.log(`After Step ${i + 1}: ${ms(Math.round(t1 - t0))}`)
  }
  return chunkedPolymer
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

function addChunks(chunkedPolymer, polymerArray, chunkSize) {
  const chunks = _.chunk(polymerArray, chunkSize)
  _.each(chunks, chunk => {
    const chunkStr = chunk.join('')
    if (chunkStr.length < chunkSize) {
      chunkedPolymer.partial = chunkStr
    } else {
      chunkedPolymer[chunkStr] = (chunkedPolymer[chunkStr] || 0) + 1
    }
  })
}

function doStep(chunkedPolymer, rules, chunkSize) {
  let currentNewPolymer = []
  _.each(chunkedPolymer, chunk => {
    // polymer chunk will always be 2n-1 the length of the chunk size. So need to merge a few chunks together then re-chunk
    const polymerChunk = doStepForChunk(chunk, rules)
    currentNewPolymer = currentNewPolymer.concat(polymerChunk)
    if (currentNewPolymer.length % chunk === 0) {
      addChunks(chunkedPolymer, currentNewPolymer, chunkSize)
      currentNewPolymer = []
    }
  })
}

function doStepForChunk(polymer, rules) {
  const newPolymer = [polymer[0]]
  for (let i = 0; i < polymer.length - 1; i++) {
    const str = polymer[i] + polymer[i + 1]
    if (rules[str]) {
      newPolymer.push(rules[str], polymer[i + 1])
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