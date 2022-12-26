import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'


async function run(testMode) {
  const elfNumbers = await getData(testMode)
  let total = 0
  for(let elfNumber of elfNumbers){
    let decimal = getDecimal(elfNumber)
    total += decimal
    console.log(elfNumber.join(''), '=', decimal)
  }
  console.log(total, '=', getElfNumber(total))
}

function getDecimal(elfNumber){
  let rtn = 0
  for(let i = elfNumber.length - 1; i >= 0; i--){
    let place = elfNumber[i]
    let pow = elfNumber.length - 1 - i
    let mod = 0
    if(place === '-'){
      mod = -1
    } else if(place === '='){
      mod = -2
    } else {
      mod = Number(place)
    }
    rtn += Math.pow(5, pow) * mod
  }
  return rtn
}

function getElfNumber(decimal){
  let rtn = []
  while(decimal !== 0){
    let x = (decimal + 2) % 5
    decimal = (decimal + 2 - x) / 5
    if(x === 0){
      rtn.unshift('=')
    } else if(x === 1){
      rtn.unshift('-')
    } else {
      rtn.unshift('' + (x-2))
    }
  }
  return rtn.join('')
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 25, isTest)
  let numbers = []
  // ignore first and last lines as the are just the wall
  for(let line of lines){
    numbers.push(line.split(''))
  }
  return numbers
}

export {run}
