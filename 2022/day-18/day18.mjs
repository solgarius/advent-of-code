import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

const CHECKS = [
  {x:-1, y:0, z:0},
  {x:1, y:0, z:0},
  {x:0, y:-1, z:0},
  {x:0, y:1, z:0},
  {x:0, y:0, z:-1},
  {x:0, y:0, z:1}
]

async function run(testMode) {
  const blocks = await getData(testMode)
  // ensure no 0s
  for(let block of blocks){
    block.x++
    block.y++
    block.z++
  }
  let maxX = 0
  let maxY = 0 
  let maxZ = 0
  for(let block of blocks){
    if(maxX < block.x) maxX = block.x
    if(maxY < block.y) maxY = block.y
    if(maxZ < block.z) maxZ = block.z
  }
  const blockMap = (new Array(maxX+2))
  for(let x = 0; x < blockMap.length; x++){
    blockMap[x] = new Array(maxY+2)
    for(let y =0; y < blockMap[x].length; y++){
      blockMap[x][y] =  (new Array(maxZ+2)).fill(0)
    }
  }
  for(let block of blocks){
    blockMap[block.x][block.y][block.z] = 1
  }
  // console.log(blockMap)
  
  const sides = getSides(blockMap, blocks)
  console.log(`Num Sides ${sides.length}`)
  blockMap[0][0][0] = -1
  setOutsides({x:0,y:0,z:0}, blockMap)
  const sides2 = getSides(blockMap, blocks, -1)
  console.log(`Num Sides 2: ${sides2.length}`)
}

function setOutsides(fromPoint, blockMap){
  for(let check of CHECKS){
    let newPoint = {x: fromPoint.x + check.x, y: fromPoint.y + check.y, z: fromPoint.z + check.z}
    if(blockMap?.[newPoint.x]?.[newPoint.y]?.[newPoint.z] === 0){
      blockMap[newPoint.x][newPoint.y][newPoint.z] = -1
      setOutsides(newPoint, blockMap)
    }
  }
}

function getSides(blockMap, blocks, checkVal = 0){
  const sides = []
  for(let block of blocks){
    let {x,y,z} = block
    for(const check of CHECKS){
      if(blockMap[x + check.x][y + check.y][z + check.z] === checkVal) {
        sides.push({x:x + check.x, y: y + check.y, z: z + check.z})
      }
    }
  }
  return sides
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 18, isTest)
  let blocks = []
  for(let line of lines){
    let [x,y,z] = line.split(',').map(n=>Number(n))
    blocks.push({x,y,z})
  }
  return blocks
 }

export {run}
