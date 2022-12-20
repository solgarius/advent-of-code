import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const numbers = await getData(testMode)
  let keyedNumbers = numbers.map((n, id) => { return {n, id}})
  console.log(doLoop(keyedNumbers).val)
  const decryptionKey = 811589153
  keyedNumbers = numbers.map((n, id) => { return {n: n*decryptionKey, id}})
  let value = 0
  for(let i =0; i < 10; i++){
    let result = doLoop(keyedNumbers)
    keyedNumbers = result.keyedNumbers
    value = result.val
  }
  console.log(value)
}

function doLoop(keyedNumbers){
  for(let id = 0; id < keyedNumbers.length; id++){
    let nextMoveIndex = keyedNumbers.findIndex(val => val.id === id)
    if(nextMoveIndex >= 0){
      if(keyedNumbers[nextMoveIndex].n === 0){
        continue // nothing to do
      }
      let newIndex = (nextMoveIndex + keyedNumbers[nextMoveIndex].n) % (keyedNumbers.length - 1)
      if(newIndex <= 0){ newIndex = keyedNumbers.length + newIndex - 1 }
      // console.log(JSON.stringify(keyedNumbers.map(k => k.n)), nextMoveIndex, newIndex)
      let prevElems = keyedNumbers.splice(nextMoveIndex, 1)
      prevElems[0].moved = true
      // as we've now removed the old item we need to offset the index
      // if(newIndex > nextMoveIndex) newIndex--  
      keyedNumbers.splice(newIndex, 0, ...prevElems)
    }
  }
  let index0 = keyedNumbers.findIndex(n => n.n === 0)
  let index1k = (index0 + 1000) % keyedNumbers.length
  let index2k = (index0 + 2000) % keyedNumbers.length
  let index3k = (index0 + 3000) % keyedNumbers.length
  let val1k = keyedNumbers[index1k].n
  let val2k = keyedNumbers[index2k].n
  let val3k = keyedNumbers[index3k].n
  // console.log(keyedNumbers, index0, index1k, index2k, index3k, val1k, val2k, val3k)
  return {val:val1k + val2k + val3k, keyedNumbers}
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 20, isTest)
  let data = []
  for(let line of lines){
    data.push(Number(line))
  }
  return data
}

export {run}
