import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const moves = await getData(testMode)
  const coveredSpaces = getNumCoveredSpaces(moves, [{x:0,y:0}, {x:0,y:0}])
  console.log(`Covered Spaces ${coveredSpaces}`)
  const coveredSpaces2 = getNumCoveredSpaces(moves, [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}])
  console.log(`Covered Spaces ${coveredSpaces2}`)
}

function getNumCoveredSpaces(moves, rope){
  let coveredSpaces = {}
  coveredSpaces[getPosStr(rope[rope.length-1])] = true
  for(const move of moves){
    doMove(rope, move, coveredSpaces)
  }
  return Object.values(coveredSpaces).length
}

function doMove(rope, move, coveredSpaces){
  for(let i =0; i < move.spaces; i++){
    if(move.direction === 'U'){
      rope[0].y++
    } else if(move.direction === 'D'){
      rope[0].y--
    } else if(move.direction === 'L'){
      rope[0].x--
    } else if(move.direction === 'R'){
      rope[0].x++
    }
    updateTailPosition(rope, coveredSpaces)
    // console.log(move.direction, head, tail)
  }
}

function updateTailPosition(rope, coveredSpaces){
  for(let i = 0; i < rope.length-1; i++){
    let head = rope[i]
    let tail = rope[i+1]
    let xDist = Math.abs(tail.x - head.x)
    let yDist = Math.abs(tail.y - head.y)


    if(xDist > 1 && yDist > 1){
      tail.x = head.x > tail.x ? head.x-1 : head.x+1
      tail.y = head.y > tail.y ? head.y-1 : head.y+1
    } else if(xDist > 1){
      tail.x = head.x > tail.x ? head.x-1 : head.x+1
      tail.y = head.y
    } else if(yDist > 1){
      tail.x = head.x
      tail.y = head.y > tail.y ? head.y-1 : head.y+1
    }
  }
  // console.log(rope.length, rope[rope.length-1])
  coveredSpaces[getPosStr(rope[rope.length-1])] = true
}

function getPosStr(pos){
  return `${pos.x}_${pos.y}`
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 9, isTest)
  let moves = []
  for(let line of lines){
    let splitLine = line.split(' ')
    moves.push({direction: splitLine[0], spaces: Number(splitLine[1])})
  }
  return moves
 }

export {run}