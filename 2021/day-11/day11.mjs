import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const energyLevels = await getEnergyLevels(testMode)
  const s1 = getNumFlashes(_.cloneDeep(energyLevels), false, 100)
  console.log(`Number of Flashes: ${s1.numFlashes} After Step: ${s1.lastStep}`)
  printEnergyLevels(energyLevels)
  const s2 = getNumFlashes(_.cloneDeep(energyLevels), true)
  console.log(`Number of Flashes: ${s2.numFlashes} After Step: ${s2.lastStep}`)
  printEnergyLevels(energyLevels)
}

function getNumFlashes(energyLevels, goUntilAllAllFlash = false, numSteps = 100) {
  let numFlashes = 0
  let numOctopi = energyLevels.length * energyLevels[0].length
  // printEnergyLevels(energyLevels)
  let step = 0;
  for (; step < numSteps || goUntilAllAllFlash; step++) {
    const numFlashesInStep = executeFlash(energyLevels)
    if (goUntilAllAllFlash && numFlashesInStep >= numOctopi) {
      // printEnergyLevels(energyLevels)
      break
    }
    numFlashes += numFlashesInStep
    // if (step < 10 || step % 10 === 9) {
    //   console.log(`After Step ${step + 1}`)
    //   printEnergyLevels(energyLevels)
    // }
  }
  const lastStep = goUntilAllAllFlash ? step + 1 : step
  return {numFlashes, lastStep}
}

function executeFlash(energyLevels) {
  let numFlashes = 0
  const flashed = []
  const flashesToExecute = []
  // step 1 - the energy level of each octopus increases by 1.
  _.each(energyLevels, (row, rowNum) => {
    flashed.push([])
    _.each(row, (value, index) => {
      row[index]++
      flashed[rowNum].push(false)
      if (row[index] > 9) {
        flashesToExecute.push([rowNum, index])
        flashed[rowNum][index] = true
      }
    })
  })
  // step 2 - Then, any octopus with an energy level greater than 9 flashes.
  // This increases the energy level of all adjacent octopuses by 1, including
  // octopuses that are diagonally adjacent. If this causes an octopus to have
  // an energy level greater than 9, it also flashes. This process continues
  // as long as new octopuses keep having their energy level increased beyond 9.
  // (An octopus can only flash at most once per step.)
  while (flashesToExecute.length > 0) {
    const [row, col] = flashesToExecute.pop()
    const checks = [
      [row - 1, col - 1],
      [row - 1, col],
      [row - 1, col + 1],
      [row, col - 1],
      [row, col + 1],
      [row + 1, col - 1],
      [row + 1, col],
      [row + 1, col + 1]
    ]
    // if (flashed[row][col]) {
    //   continue // don't re-flash
    // }
    _.each(checks, (check) => {
      const [row, col] = check
      if (energyLevels?.[row]?.[col] != null && !flashed?.[row]?.[col]) {
        energyLevels[row][col]++
        if (energyLevels[row][col] > 9) {
          flashed[row][col] = true
          flashesToExecute.push([row, col])
        }
      }
    })
  }

  // step 3 - Finally, any octopus that flashed during this step has its energy
  // level set to 0, as it used all of its energy to flash.
  _.each(energyLevels, row => {
    _.each(row, (value, index) => {
      if (row[index] > 9) {
        numFlashes++
        row[index] = 0
      }
    })
  })
  return numFlashes
}

function printEnergyLevels(energyLevels) {
  let str = ''
  _.each(energyLevels, row => {
    _.each(row, value => {
      str += value
    })
    str += '\n'
  })
  console.log(str)
}

async function getEnergyLevels(isTest) {
  let filename = isTest ? './day-11/energyLevelsTest.csv' : './day-11/energyLevels.csv'
  const lines = await getLines(filename)
  return _.map(lines, line => {
    return line.split('').map(n => Number(n))
  })
}

export {run}