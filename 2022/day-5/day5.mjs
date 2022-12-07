import {getLinesForDay} from '../../util/utility.mjs'

// [S]                 [T] [Q]        
// [L]             [B] [M] [P]     [T]
// [F]     [S]     [Z] [N] [S]     [R]
// [Z] [R] [N]     [R] [D] [F]     [V]
// [D] [Z] [H] [J] [W] [G] [W]     [G]
// [B] [M] [C] [F] [H] [Z] [N] [R] [L]
// [R] [B] [L] [C] [G] [J] [L] [Z] [C]
// [H] [T] [Z] [S] [P] [V] [G] [M] [M]
//  1   2   3   4   5   6   7   8   9 
const ARRAYS = [
  [],
  ['S','L','F','Z','D','B','R','H'],
  ['R','Z','M','B','T'],
  ['S','N','H','C','L','Z'],
  ['J','F','C','S'],
  ['B','Z','R','W','H','G','P'],
  ['T','M','N','D','G','Z','J','V'],
  ['Q','P','S','F','W','N','L','G'],
  ['R','Z','M'],
  ['T','R','V','G','L','C','M']
]

// [D]    
// [N] [C]    
// [Z] [M] [P]
//  1   2   3 
const TEST_ARRAYS = [
  [],
  ['N','Z'],
  ['D','C','M'],
  ['P']
]

async function run(testMode) {
  const data = await getData(testMode)
  let arrays = testMode ? TEST_ARRAYS : ARRAYS
  
  data.forEach((movement)=>{
    // console.log(movement)
    let front = arrays[movement.from].slice(0, movement.move)
    // front.reverse()
    arrays[movement.from].splice(0,movement.move)
    arrays[movement.to] = front.concat(arrays[movement.to])
    // console.log(arrays)
  })
  let str =''
  for(let i =1;i<arrays.length;i++){
    str += arrays[i][0]
  }
  console.log(str)
}


async function getData(isTest) {
  const lines = await getLinesForDay(2022, 5, isTest)
  let data = []
  for (const line of lines) {
    try {
      const splitLine = line.split(' ')
      data.push({move: Number(splitLine[1]), from: Number(splitLine[3]), to: Number(splitLine[5])})
    } catch (e) {
    }
  }
  return data
}

export {run}