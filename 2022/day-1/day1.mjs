import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const elves = await getData(testMode)
  const mostCalories = await runSingle(elves)
  const totalTop3 = await runTop3(elves)

  console.log(`Most Calories ${mostCalories}`)
  console.log(`Total Top 3 ${totalTop3}`)
}

async function runSingle(elves = []) {
  let mostCalories = 0
  for (const elf of elves) {
    if(elf && elf.total > mostCalories){
      mostCalories = elf.total
    }
  }
  return mostCalories
}

async function runTop3(elves = [0]) {
  elves.sort((elf1, elf2)=>elf2.total-elf1.total)
  return elves[0].total + elves[1].total + elves[2].total
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 1, isTest)
  let elves = [{total:0, items:[]}]
  let biggestElf = elves[0]
  for (const line of lines) {
    try {
      const calories = line ? Number(line) : null
      if (calories != null) {
        let elf = elves[elves.length-1]
        elf.items.push(calories)
        elf.total += calories
      } else {
        elves.push({total:0, items:[]})
      }
    } catch (e) {
    }
  }
  return elves
}

export {run}