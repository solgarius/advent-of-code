import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const encodedStr = await getData(testMode)
  console.log(`Step 1 Index ${findNUniqueChars(encodedStr, 4)}`)
  console.log(`Step 2 Index ${findNUniqueChars(encodedStr, 14)}`)
}

function findNUniqueChars(encodedStr, numUnique){
  for(let i = 0; i < encodedStr.length - (numUnique-1); i++){
    let map = {}
    for(let j = 0; j < numUnique; j++){
      map[encodedStr[i+j]] = true
    }
    if(Object.keys(map).length === numUnique){
      console.log(map)
      return i+numUnique
    }
  }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 6, isTest)
  return lines[0]
 }

export {run}