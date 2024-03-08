import {memoize} from '../../util/utility.mjs'

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  let instructions = []
  for(let line of lines) {
    instructions = instructions.concat(line.split(','))
  }
  return { instructions }
}

function part1({ instructions } = {}) {
  let sum = 0
  for(let instruction of instructions) {
    let result = getHash(instruction)
    sum += result
  }
  return sum
}

function part2({ instructions  } = {}) {
  let boxes = []
  for(let instruction of instructions) {
    let [action, label, focalLength] = splitInstruction(instruction)
    if(action === 'x'){
      continue
    }
    let box = getHash(label || '')
    if(action === '-' && boxes[box]){
      boxes[box] = boxes[box].filter((lens) => lens.label !== label)
    } else if(action === '=') {
      if(!boxes[box]){
        boxes[box] = []
      }  
      let existingLens = boxes[box].find((lens) => lens.label === label)
      if(existingLens) {
        existingLens.focalLength = focalLength
      } else {
        boxes[box].push({ label, focalLength })
      }
    }
    // console.log(instruction, box, boxes[box])
  }
  let totalPower = 0
  for(let boxIndex = 0; boxIndex < boxes.length; boxIndex++) {
    let box = boxes[boxIndex]
    if(box && box.length > 0) {
      let focusingPower = 0
      for(let lensIndex = 0; lensIndex < box.length; lensIndex++) {
        let lens = box[lensIndex]
        focusingPower += lens.focalLength * (lensIndex+1) * (boxIndex+1)
      }
      totalPower += focusingPower
    }
  }
  return totalPower
}

function splitInstruction(instruction) {
  let split = instruction.split('-')
  if(split.length === 2) {
    return ['-', split[0]]
  } else {
    split = instruction.split('=')
    return ['=', split[0], parseInt(split[1])]
  }
  return ['x']
}

function getHash(instruction) {
  let curVal = 0
  let ins = instruction.split('')
  for(let char of ins){
    curVal = getHashChar(char, curVal)
  }
  return curVal
}

function getHashChar(char, curVal) {
  return (curVal + char.charCodeAt(0)) * 17 % 256
}


export { run }
