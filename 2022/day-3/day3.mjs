import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const bags = await getData(testMode)
  let perBagTotal = 0
  let perGroupTotal = 0
  let curGroup = []
  bags.forEach((bag)=>{
    let letter = getCommonLetter([bag.left, bag.right])
    perBagTotal += getLetterPriority(letter)
    curGroup.push(bag.contents)
    if(curGroup.length === 3){
      letter = getCommonLetter(curGroup)
      perGroupTotal += getLetterPriority(letter)
      curGroup = []
    }
    // console.log(bag, letter, weight, perBagTotal)
  })
  console.log(`Per Bag Total ${perBagTotal}`)
  console.log(`Per Group Total ${perGroupTotal}`)
}

function getLetterPriority(letter){
  const A = 'A'.charCodeAt(0)
  const Z = 'Z'.charCodeAt(0)
  const a = 'a'.charCodeAt(0)
  const z = 'z'.charCodeAt(0)
  if(letter){ letter = letter.charCodeAt(0) }
  if(letter && a <= letter && letter <= z){
    return (letter - a) + 1
  } else if(letter && A <= letter && letter <= Z){
    return (letter - A) + 27
  }
  return 0
}

function getCommonLetter(strings = []){
  let firstArr = (strings[0] || '').split('')
  return firstArr.find(item => {
    for(let i = 1; i < strings.length; i++){
      if(strings[i].indexOf(item) < 0){
        return false
      }
    }
    return true
  })
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 3, isTest)
  let bags = []

  for (const line of lines) {
    try {
      bags.push({contents: line, left: line.slice(0,line.length/2), right: line.slice(line.length/2)})
    } catch (e) {
    }
  }
  return bags
}

export {run}