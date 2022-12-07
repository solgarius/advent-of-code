import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const data = await getData(testMode)
  let fullOverlapCount = 0
  let partOverlapCount = 0
  data.forEach((elfCleaning)=>{
    const fullOverlap = isOverlappedFully(elfCleaning)
    const partOverlap = isOverlappedPartially(elfCleaning)
    console.log(elfCleaning, fullOverlap, partOverlap)
    if(fullOverlap){
      fullOverlapCount++
    }
    if(partOverlap){
      partOverlapCount++
    }
  })
  console.log(`Full Overlap Count ${fullOverlapCount}`)
  console.log(`Part Overlap Count ${partOverlapCount}`)
}

function isOverlappedFully(elfCleaning){
  let {elf1, elf2} = elfCleaning
  return (elf1[0] <= elf2[0] && elf1[1] >= elf2[1]) || (elf2[0] <= elf1[0] && elf2[1] >= elf1[1])
}

function isOverlappedPartially(elfCleaning){
  let {elf1, elf2} = elfCleaning
  return (elf1[0] <= elf2[0] && elf2[0] <= elf1[1]) || (elf1[0] <= elf2[0] && elf2[0] <= elf1[1]) ||
  (elf2[0] <= elf1[0] && elf1[0] <= elf2[1]) || (elf2[0] <= elf1[0] && elf1[0] <= elf2[1])
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 4, isTest)
  let data = []
  for (const line of lines) {
    try {
      const splitLine = line.split(',')
      let elf1Split = splitLine[0].split('-')
      let elf2Split = splitLine[1].split('-')
      data.push({elf1: [Number(elf1Split[0]), Number(elf1Split[1])], elf2: [Number(elf2Split[0]), Number(elf2Split[1])]})
    } catch (e) {
    }
  }
  return data
}

export {run}