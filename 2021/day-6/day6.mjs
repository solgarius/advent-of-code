import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const lanternFish = await getLanternFish(testMode)
  let numFish = getNumberOfFish(_.cloneDeep(lanternFish))
  console.log(`Num Lantern Fish After 80 Days: ${numFish}`)
  numFish = getNumberOfFish(_.cloneDeep(lanternFish), 256)
  console.log(`Num Lantern Fish After 256 Days: ${numFish}`)
}

function getNumberOfFish(lanternFish, numDays = 80) {
  const possibleAges = 9
  let numFishAtAge = _.fill(Array(possibleAges), 0)
  _.each(lanternFish, fishAge => {
    numFishAtAge[fishAge]++
  })
  for (let i = 0; i < numDays; i++) {
    let newFish = 0
    console.log(numFishAtAge)
    for (let age = 0; age < possibleAges; age++) {
      // find how many fish go to day 6 & 8.
      if (age === 0) {
        newFish = numFishAtAge[age]
      }
      // every fish gets nearer new offspring
      if (age < possibleAges - 1) {
        numFishAtAge[age] = numFishAtAge[age + 1]
      }
      // add the new fish in
      if (age === 6) {
        numFishAtAge[age] += newFish
      } else if (age === possibleAges - 1) {
        numFishAtAge[age] = newFish
      }
    }
  }
  return _.sum(numFishAtAge)
}

async function getLanternFish(isTest) {
  let filename = isTest ? './day-6/lanternFishTest.csv' : './day-6/lanternFish.csv'
  const lines = await getLines(filename)
  // get the line segments
  return lines[0].split(',').map(num => Number(num))
}

export {run}