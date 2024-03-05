import {memoize} from '../../util/utility.mjs'

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  let patterns = []
  let pattern = []
  // split out the lines and map to base nodes
  for (let line of lines) {
    if (line === '') {
      patterns.push({pattern, rotated: getRotatedPattern(pattern)})
      pattern = []
      continue
    }
    pattern.push(line)
  }
  if(pattern.length > 0){
    patterns.push({pattern, rotated: getRotatedPattern(pattern)})
  }

  return { patterns }
}

function part1({ patterns } = {}) {
  let score = 0
  for (let pattern of patterns) {
    let row = findMirrorRow(pattern.pattern)
    if(row >= 0){
      score += 100*(row+1)
    }
    let col = findMirrorRow(pattern.rotated)
    if(col >= 0){
      score += (col+1)
    }
  }
  return score
}

function part2({ patterns } = {}) {
  let score = 0
  for (let pattern of patterns) {
    let row = findMirrorRow(pattern.pattern, 1)
    if(row >= 0){
      score += 100*(row+1)
    }
    let col = findMirrorRow(pattern.rotated, 1)
    if(col >= 0){
      score += (col+1)
    }
  }
  return score  
}

function findMirrorRow(pattern, numDiffChar = 0){
  for (let i = 0; i < pattern.length-1; i++) {
    // if(pattern[i] === pattern[i+1]) {
    if(isMirror(pattern, i, numDiffChar)){
      return i
    }
    // }
  }
  return -1
}

function isMirror(pattern, row, numDiffChar){
  let remainingDiffs = numDiffChar
  for(let i1 = row, i2 = row+1; i1 >= 0 && i2 < pattern.length; i1--, i2++) {
    for(let i =0; i < pattern[i1].length; i++) {
      if(pattern[i1][i] !== pattern[i2][i]) {
        remainingDiffs--
      }
    }
    if(remainingDiffs < 0){
      return false
    }
  }
  return remainingDiffs === 0
}

function getRotatedPattern(pattern) {
  let rotatedPattern = []
  for(let i = 0; i < pattern[0].length; i++) {
    rotatedPattern.push('')
  }
  for(let i = 0; i < pattern.length; i++) {
    let len = pattern[i].length
    for(let j = 0; j < len; j++) {
      rotatedPattern[j] += pattern[pattern.length-1-i][j]
    }
  }
  return rotatedPattern
}

export { run }
