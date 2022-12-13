import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const pairs = await getData(testMode)
  let sumIndicies = comparePairs(pairs)
  console.log(`Sum of Indicies ${sumIndicies}`)
  let allItems = []
  for(let pair of pairs){
    allItems.push(pair.left)
    allItems.push(pair.right)
  }

  let dividers = [[[2]], [[6]]]
  allItems.push(...dividers)
  let decoderKey = 1
  for(let divider of dividers){
    let index = getIndexOfItem(divider, allItems)
    decoderKey *= (index+1)
  }
  console.log(`Decoder Key: ${decoderKey}`)
}

function comparePairs(pairs){
  let sumIndicies = 0
  for(let i =0; i < pairs.length; i++){
    let pair = pairs[i]
    let result = comparePair(pair.left, pair.right)
    if(result > 0){
      sumIndicies += i+1
    }
  }
  return sumIndicies
}

function getIndexOfItem(item, allItems){
  let lessThanCount = 0
  for(let allItem of allItems){
    let result = comparePair(item, allItem)
    if(result < 0){ // allItem before item
      lessThanCount++
    }
  }
  return lessThanCount
}

function comparePair(left, right){
  if(left != null && right == null){
    return -1
  } else if(left == null && right != null){
    return 1
  } else if(left == null && right == null){
    return 0
  }
  let isLeftArr = _.isArray(left)
  let isRightArr = _.isArray(right)
  if(isLeftArr !== isRightArr){
    if(!isLeftArr){
      left = [left]
      isLeftArr = true
    } else {
      right = [right]
      isRightArr = true
    }
  }
  if(isLeftArr && isRightArr){
    for(let i = 0; i < left.length; i++){
      let result = comparePair(left[i], right[i])
      if(result != 0){
        return result
      }
    }
    return right.length - left.length
  }
  return right - left
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 13, isTest)
  let pairs = []
  let pair = {}
  for(let line of lines){
    if(line.length > 0){
      let parsedLine = JSON.parse(line)
      if(!pair.left){
        pair.left = parsedLine
      } else if(!pair.right) {
        pair.right = parsedLine
      }
      if(pair.left && pair.right){
        pairs.push(pair)
        pair = {}
      }
    }
  }
  return pairs
 }

export {run}
