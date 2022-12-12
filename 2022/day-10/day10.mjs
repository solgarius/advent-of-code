import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const commands = await getData(testMode)
  const signalStrength = getSignalStrength(commands,[20,60,100,140,180,220])
  console.log(`Signal Strength ${signalStrength}`)
  const image = getImage(commands)
  console.log(image)
  
}

function getSignalStrength(commands, cycles){
  let cycle = 1
  let reg = 1
  let strengths = []
  let overallStrength = 0
  for(let i = 0; i < commands.length; i++){
    let command = commands[i]
    let numCyclesThisStep = 0
    if(command.arg === 'noop'){ 
      numCyclesThisStep = 1
    } else if (command.arg === 'addx'){
      numCyclesThisStep = 2
    }
    if(cycles[0] < (cycle + numCyclesThisStep)){
      let strengthCycle = cycles.shift()
      strengths.push(strengthCycle*reg)
      overallStrength+= strengths[strengths.length-1]
      console.log(strengthCycle, cycle, command, reg)
    }
    if(command.arg === 'addx'){
      reg += command.value
    }
    cycle += numCyclesThisStep
  }
  return overallStrength
}

function getImage(commands){
  let sprite = 1
  let nextMoveCycle = 0
  let nextSpriteMovement = 0
  let image = ''
  const ROWS = 6
  const COLS = 40
  for(let cycle = 0; cycle < ROWS*COLS; cycle++){
    let drawPosition = cycle % COLS
    if(nextMoveCycle <= cycle){
      const command = commands.shift()
      sprite += nextSpriteMovement
      if(command.arg === 'noop'){
        nextMoveCycle++
        nextSpriteMovement = 0
      } else if(command.arg === 'addx'){
        nextMoveCycle+=2
        nextSpriteMovement = command.value
      }
    }
    if(sprite-1 <= drawPosition && drawPosition <= sprite+1 ){
      image += '#'
    } else {
      image += '.'
    }
    if(drawPosition === COLS-1){ image += '\n' }
  }
  return image
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 10, isTest)
  let commands = []
  for(let line of lines){
    let splitLine = line.split(' ')
    commands.push({arg: splitLine[0], value: Number(splitLine[1])})
  }
  return commands
 }

export {run}