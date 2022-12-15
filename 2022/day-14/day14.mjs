import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const {cave, startPoint} = await getData(testMode)
  printCave(cave)
  console.log('')
  let numAdded = addSand(cave, startPoint)
  printCave(cave)
  console.log(`Num Added Part 1: ${numAdded}`)
  let cave2 = []
  let oldWidth = cave[0].length

  let newWidth = 2*cave.length + 3
  if((newWidth-oldWidth) % 2 === 1){ newWidth++ }
  let startPointOffset = Math.round(startPoint.x - oldWidth/2) 
  let newSideWidth = (newWidth-oldWidth)/2
  for(let row of cave){
    cave2.push([...(new Array(newSideWidth-startPointOffset)).fill('.'),...row, ...(new Array(newSideWidth+startPointOffset)).fill('.')])
  }
  cave2.push((new Array(cave2[0].length).fill('.')))
  cave2.push((new Array(cave2[0].length).fill('#')))
  console.log('\n\n')
  startPoint.x = cave2[0].findIndex(v=> v=== '+')
  // console.log(startPoint)
  numAdded += addSand(cave2, startPoint)
  console.log('')
  printCave(cave2)
  console.log(`Num Added Part 2: ${numAdded}`)
}

function addSand(cave, startPoint){
  let numAdded = 0
  let nextSand = getNextSandPoint(cave, startPoint)
  while(nextSand){
    cave[nextSand.y][nextSand.x] = 'o'
    numAdded++
    nextSand = getNextSandPoint(cave, startPoint)
  }
  return numAdded
}

function getNextSandPoint(cave, startPoint){
  let curPoint = {...startPoint}
  if(cave[curPoint.y][curPoint.x] === 'o' || cave[curPoint.y][curPoint.x] === '#'){
    return null
  }
  while(true){
    let vals = [null, null, null]
    // vals are down, down-left, down-right
    if(cave[curPoint.y+1]){
      vals = [
        cave[curPoint.y+1][curPoint.x] || null, 
        cave[curPoint.y+1][curPoint.x-1] || null, 
        cave[curPoint.y+1][curPoint.x+1] || null
      ]
    }
    let blockedVals = vals.map(val => {
      return val == null ? null : (val == 'o' || val == '#')
    })
    let unblocked = false
    for(let i =0; i < blockedVals.length; i++){
      if(blockedVals[i] == null){
        return null // fell off map
      } else if(!blockedVals[i]){
        if(i === 0){
          curPoint = {x: curPoint.x, y: curPoint.y+1 }
        } else if(i === 1){
          curPoint = {x: curPoint.x-1, y: curPoint.y+1 }
        } else {
          curPoint = {x: curPoint.x+1, y: curPoint.y+1 }
        }
        unblocked = true
        break
      }
    }
    if(!unblocked){
      // curPoint is now last spot that is unblocked.
      return curPoint
    }
  }
}


function printCave(cave){
  for(let row of cave){
    console.log(row.join(''))
  }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 14, isTest)
  let minX = Number.MAX_SAFE_INTEGER
  let maxX = 0
  let minY = Number.MAX_SAFE_INTEGER
  let maxY = 0
  let rockLines = []
  for(let line of lines){
    if(line.length > 0){
      let splitLine = line.split(' -> ').map(points=> {
        let numPoints = points.split(',').map(n=>Number(n))
        return {x: numPoints[0], y: numPoints[1]}
    })
      for(let i =0; i < splitLine.length-1; i++){
        let start = {...splitLine[i]}
        let end = {...splitLine[i+1]}
        if(i === 0){
          if(start.x < minX) minX = start.x 
          if(start.x > maxX) maxX = start.x 
          if(start.y < minY) minY = start.y 
          if(start.y > maxY) maxY = start.y 
        }
        if(end.x < minX) minX = end.x 
        if(end.x > maxX) maxX = end.x 
        if(end.y < minY) minY = end.y 
        if(end.y > maxY) maxY = end.y 
      rockLines.push({start,end})
      }
    }
  }
  let startPoint = {x:500, y:0}
  let xOffset = minX-1
  for(let rockLine of rockLines){
    rockLine.start.x -= xOffset
    rockLine.end.x -= xOffset
  }
  maxX -= xOffset
  startPoint.x -= xOffset
  minX = 0
  console.log(minX, maxX, minY, maxY, rockLines, startPoint)
  let cave = []
  for(let i =0;i<=maxY;i++){
    cave.push((new Array(maxX+1)).fill('.'))
  }
  cave[startPoint.y][startPoint.x] = '+'
  for(let rockLine of rockLines){
    let startX = Math.min(rockLine.start.x, rockLine.end.x)
    let endX = Math.max(rockLine.start.x, rockLine.end.x)
    let startY = Math.min(rockLine.start.y, rockLine.end.y)
    let endY = Math.max(rockLine.start.y, rockLine.end.y)
    for(let y = startY; y <= endY; y++){
      for(let x = startX; x <= endX; x++){
        cave[y][x] = '#'
      }
    }
  }
  return {cave, startPoint}
 }

export {run}
