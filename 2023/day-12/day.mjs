import {memoize} from '../../util/utility.mjs'

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  let springLists = []

  // split out the lines and map to base nodes
  for (let line of lines) {
    springLists.push({
      springs: line.split(' ')[0],
      answer: line.split(' ')[1].split(',').map((x) => parseInt(x))
    })
  }

  return { springLists }
}

function part1({ springLists } = {}) {
  let totalArrangements = 0
  let start = Date.now()
  for (let i =0 ; i < springLists.length; i++) {
    totalArrangements += getNumArrangementsForSpringList(springLists[i], i+1, start, false)
  }
  return totalArrangements
}

function part2({ springLists } = {}) {
  const duplications = 5
  let newSpringLists = []
  for(let springList of springLists) {
    let {springs, answer} = springList
    let newSprings = ''
    let newAnswer = []
    for (let i = 0; i < duplications; i++) {
      if(i > 0) { 
        newSprings += '?'
      }
      newSprings += springs
      newAnswer.push(...answer)
    }
    let newSpringList = { springs: newSprings, answer: newAnswer }
    newSpringLists.push(newSpringList)
  }
  let totalArrangements = 0
  let start = Date.now()
  for (let i =0 ; i < newSpringLists.length; i++) {
    let result = getNumArrangementsForSpringList(newSpringLists[i], i+1, start, false)
    totalArrangements += result
  }
  return totalArrangements
}

function getNumArrangementsForSpringList(springList, line, start, log = true) {
  const t0 = Date.now()
  const answer = [...springList.answer] // lazy copy answer list
  const springs = springList.springs + '' // lazy copy string
  const numPoss = getNumPossiblePositions(springs, answer)
  let t1 = Date.now()
  let totDuration = t1 - start
  if(log){ 
    console.log(`Line ${line} | ${totDuration/1000}s | ${t1-t0}`, numPoss, springs, answer) 
  }
  return numPoss
}

const getNumPossiblePositions = memoize((springs, answerList) => {
  let mustUseLoc = getFirstLocation(springs, '#')
  let cantUseLoc = getFirstLocation(springs, '.', 0)
  let total = 0
  let [nextLen, ...restAnswers] = answerList
  let minStrLength = getMinRemainingLength(restAnswers)
  let endPos = springs.length - minStrLength
  if(mustUseLoc >= 0 && endPos > mustUseLoc) {
    endPos = Math.min(mustUseLoc+nextLen, springs.length)
  }
  endPos -= nextLen
  for(let i = 0; i <= endPos; i++) {
    if(cantUseLoc >= 0 && cantUseLoc < i){
      cantUseLoc = getFirstLocation(springs, '.', i)
    }
    let nextBad = nextBadIndex(i, nextLen, springs)
    if(nextBad >= 0){
      i = nextBad
    } else { // no bad indexes so can add
      if(restAnswers.length === 0) {
        if(getFirstLocation(springs, '#', i+nextLen) >= 0) {
          if(mustUseLoc === i){
            break // cannot get this # and the latter #
          }
          continue
        }
        total++
      } else {
        let newStr = springs.substring(i+nextLen+1)
        total += getNumPossiblePositions(newStr, restAnswers)
      }
    }
  }

  return total
})

function nextBadIndex(start, len, springs) {
  let letterBefore = start > 0 ? springs[start-1] : '?'
  let letterAfter = start+len < springs.length ? springs[start+len] : '?'
  if (letterBefore !== '#' && letterAfter !== '#') {
    for(let j = start; j < start+len; j++) {
      if(springs[j] === '.') {
        return j
      }
    }
    return -1
  }
  return start
}

function getFirstLocation(springs, char = '#', startIndex = 0){
  for (let i = startIndex; i < springs.length; i++) {
    if(springs[i] === char) {
      return i
    }
  }
  return -1
}

const getMinRemainingLength = memoize((answerList) => {
  if(answerList.length === 0){ return 0 }
  let total = answerList.length // the '.' gaps including the . before these answers start
  for (let i = 0; i < answerList.length; i++) {
    total += answerList[i] // the '#' characters
  }
  return total
})

export { run }
