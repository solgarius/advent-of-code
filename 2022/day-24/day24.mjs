import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'

const DOWN = 'v'
const UP = '^'
const LEFT = '<'
const RIGHT = '>'
const STAY_PUT = '*'


async function run(testMode) {
  const valleyData = await getData(testMode)
  let start = {x: 1, y: 0}
  let end = {x: valleyData.width - 2, y: valleyData.height - 1}
  const valley = new Valley(valleyData.blizzards, start, end, valleyData.height, valleyData.width)
  let fewestMoves = findFewestMoves(valley)
  console.log(`Fewest Moves 1: ${fewestMoves}`)
  let temp = valley.end
  valley.end = valley.start
  valley.start = temp
  fewestMoves = findFewestMoves(valley, fewestMoves)
  console.log(`Fewest Moves 2: ${fewestMoves}`)
  temp = valley.end
  valley.end = valley.start
  valley.start = temp
  fewestMoves = findFewestMoves(valley, fewestMoves)
  console.log(`Fewest Moves 3: ${fewestMoves}`)
  
}

function getPointStr (point){
  return `${point.x}_${point.y}`
}

function findFewestMoves(valley, t0 = 0) {
  let nodes = [{p: valley.start, t: t0}]
  let iters = 0
  while(nodes.length > 0){
    let node = nodes.shift()
    iters++
    if(iters % 100000 === 0){
      console.log(node, nodes.length)
    }
    let possibleMoves = [UP,DOWN,LEFT,RIGHT,STAY_PUT].map(move=> {
      let newPoint = getNewPoint(move, node.p)
      if(valley.isClear(newPoint, node.t+1)){
        return {p:newPoint, t: node.t+1, m: move}
      }
      return null
    }).filter(n => !!n)
    // console.log(possibleMoves)
    for(let possibleMove of possibleMoves){
      if(possibleMove.p.x === valley.end.x && possibleMove.p.y === valley.end.y){
        return possibleMove.t
      }
      let idx = nodes.findIndex(n => n.p.x === possibleMove.p.x && n.p.y === possibleMove.p.y && n.t === possibleMove.t)
      if(idx < 0) nodes.push(possibleMove)
    }
  }
}

function getNewPoint(move, point){
  let newPoint = {...point}
  if(move === UP){
    newPoint.y--
  } else if(move === DOWN){
    newPoint.y++
  } else if(move === LEFT){
    newPoint.x--
  } else if(move === RIGHT){
    newPoint.x++
  }
  return newPoint
}

class Valley {
  constructor(blizzards, start, end, height, width) {
    this.blizzards = blizzards
    this.start = start
    this.end = end
    this.height = height
    this.width = width

    this.byRows = {}
    this.byCols = {}
  
    for(let blizzard of blizzards){
      if(blizzard.d === LEFT || blizzard.d === RIGHT){
        this.byRows[blizzard.y] = this.byRows[blizzard.y] || []
        this.byRows[blizzard.y].push(blizzard)
      } else {
        this.byCols[blizzard.x] = this.byCols[blizzard.x] || []
        this.byCols[blizzard.x].push(blizzard)
      }
    }
  }

  isClear (point, atTime){
    if(this.isWall(point)){
      return false
    }
    if(this.byRows[point.y]){
      let ix = this.byRows[point.y].findIndex(blizzard=>{
        let xAtTime = 0
        let shiftBy = atTime % (this.width-2)
        if(blizzard.d === RIGHT){
          xAtTime = ((blizzard.x - 1 + shiftBy) % (this.width-2)) + 1
        } else {
          xAtTime = ((blizzard.x - 1 + this.width - 2 - shiftBy) % (this.width-2)) + 1
        }
        return point.x === xAtTime
      })
      if(ix >= 0){ return false }
    }
    if(this.byCols[point.x]){
      let iy = this.byCols[point.x].findIndex(blizzard=>{
        let yAtTime = 0
        let shiftBy = atTime % (this.height-2)
        if(blizzard.d === DOWN){
          yAtTime = ((blizzard.y - 1 + shiftBy) % (this.height-2)) + 1
        } else {
          yAtTime = ((blizzard.y - 1 + this.height - 2 - shiftBy) % (this.height-2)) + 1
        }
        return point.y === yAtTime
      })
      if(iy >= 0){ return false }  
    }
    return true
  }

  isWall(point){
    if(point.x === this.end.x && point.y === this.end.y) return false
    if(point.x === this.start.x && point.y === this.start.y) return false
    if(point.x <= 0 || point.x === this.width - 1){
      return true
    }
    if(point.y <= 0 || point.y >= this.height-1){
      return true
    }
    return false
  }

}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 24, isTest)
  let blizzards = []
  let width = lines[0].length
  let height = lines.length
  // ignore first and last lines as the are just the wall
  for(let y = 1; y< lines.length-1; y++){
    let line = lines[y]
    let splitLine = line.split('')
    // ignore first and last column as they are the wall
    for(let x = 1; x < splitLine.length-1; x++){
      let char = splitLine[x]
      if(char !== '.'){
        blizzards.push({x, y, d: char})
      }
    }
  }
  return {  
    blizzards, 
    width,
    height, 
    blizzardWidth: width-2, 
    blizzardHeight: height-2
  }
}

export {run}
