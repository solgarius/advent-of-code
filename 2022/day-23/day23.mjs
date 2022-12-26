import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'

const SEARCH_ORDER = ['n','s','w','e']

async function run(testMode) {
  const elfMap = await getData(testMode)
  doPart1(elfMap)
}

function doPart1(elfMap){
  let numMoves = 1000
  setupMapStart(elfMap, numMoves)
  // printMap(elfMap)
  let searchStart = 0
  for(let i = 0; i < numMoves;i++){
    if(i%100 === 0){ console.log(i) }
    // console.log('Moving: ' + SEARCH_ORDER[searchStart].toUpperCase())
    let anyMoves = doMove(elfMap, searchStart)
    if(!anyMoves){
      console.log(`No More Moves after ${i+1} moves`)
      break
    } 
    
    searchStart = (searchStart+1) % SEARCH_ORDER.length
    // printMap(elfMap)
  }
  let minI = elfMap.length
  let maxI = 0
  let minJ = elfMap[0].length
  let maxJ = 0
  let elfCount = 0
  for(let i =0; i < elfMap.length; i++){
    for(let j = 0;j < elfMap[i].length; j++){
      if(elfMap[i][j] === '#'){
        elfCount++
        if(minI > i) minI = i
        if(maxI < i) maxI = i
        if(minJ > j) minJ = j
        if(maxJ < j) maxJ = j
      }
    }
  }
  let emptyTiles = (maxI + 1 - minI)*(maxJ + 1 - minJ) - elfCount
  console.log(`Part 1: ${emptyTiles}`)
}

function doMove(elfMap, searchStart){
  let moves = {}
  for(let i = 0; i < elfMap.length; i++){
    for(let j =0; j < elfMap[i].length; j++){
      if(elfMap[i][j] === '#'){
        let move = getMoveForElf(i, j, elfMap, searchStart)
        if(move){
          move.f = elfMap[move.from.i][move.from.j]
          move.t = elfMap[move.to.i][move.to.j]
          let moveStr = getMoveStr(move.to)
          if(!moves[moveStr]) moves[moveStr] = {to: move.to, from: null, count: 0}
          moves[moveStr].from = move.from
          moves[moveStr].count++
          moves[moveStr].f = move.f
          moves[moveStr].t = move.t
          moves[moveStr].d = move.dir
        }
      }
    }
  }
  
  let keys = Object.keys(moves)
  let anyMoves = false
  // console.log(moves, keys.length)
  for(let i = 0; i < keys.length; i++){
    let move = moves[keys[i]]
    if(move.count === 1){
      elfMap[move.from.i][move.from.j] = '.'
      elfMap[move.to.i][move.to.j] = '#'
      anyMoves = true
    }
  }
  return anyMoves
}

function getMoveForElf(i, j, elfMap, searchStart){
  let nw = elfMap[i-1][j-1] === '.'
  let n = elfMap[i-1][j] === '.'
  let ne = elfMap[i-1][j+1] === '.'
  let w = elfMap[i][j-1] === '.'
  let e = elfMap[i][j+1] === '.'
  let sw = elfMap[i+1][j-1] === '.'
  let s = elfMap[i+1][j] === '.'
  let se = elfMap[i+1][j+1] === '.'
  if(nw && n && ne && w && e && sw && s && se){
    return null // nothing to move because nothing around
  }
  for(let x = 0; x < SEARCH_ORDER.length; x++){
    let dir = SEARCH_ORDER[(x+searchStart) % SEARCH_ORDER.length]
    if(dir === 'n' && nw && n && ne){
      return {from: {i,j}, to: {i:i-1, j}, dir}
    }
    if(dir === 's' && sw && s && se){
      return {from: {i,j}, to: {i:i+1, j}, dir}
    }
    if(dir === 'w' && nw && w && sw){
      return {from: {i,j}, to: {i:i, j:j-1}, dir}
    }
    if(dir === 'e' && ne && e && se){
      return {from: {i,j}, to: {i:i, j:j+1}, dir}
    }
  }
  return null
}

function getMoveStr(pos){
  return `${pos.i}_${pos.j}`
}

function printMap(elfMap){
  for(let row of elfMap){
    console.log(row.join(''))
  }
  console.log('')
}

function setupMapStart(elfMap, numMoves){
  // therefore max moves beyond current grid is 10 so expand grid so it has the extra space
  let curHeight = elfMap.length
  for(let r = 0; r < curHeight; r++){
    elfMap[r] = (new Array(numMoves)).fill('.').concat(elfMap[r], (new Array(numMoves)).fill('.'))
  }
  let curWidth = elfMap[0].length
  for(let i =0; i < numMoves; i++){
    elfMap.unshift(new Array(curWidth).fill('.'))
    elfMap.push(new Array(curWidth).fill('.'))
  }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 23, isTest)
  let map = []
  for(let line of lines){
    map.push(line.split(''))
  }
  return map
}

export {run}
