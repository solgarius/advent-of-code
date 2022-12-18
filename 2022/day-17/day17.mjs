import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

const HORIZ_LINE = [{x:0, y:0},{x:1, y:0},{x:2,y:0},{x:3, y:0}]
const PLUS = [{x:1, y:0},{x:0, y:1},{x:1,y:1},{x:2, y:1},{x:1,y:2}]
const L = [{x:2, y:0},{x:2, y:1},{x:0,y:2},{x:1, y:2},{x:2,y:2}]
const VERT_LINE = [{x:0, y:0},{x:0, y:1},{x:0,y:2},{x:0, y:3}]
const SQUARE = [{x:0, y:0},{x:1, y:0},{x:0,y:1},{x:1, y:1}]

const ORDER = [HORIZ_LINE, PLUS, L, VERT_LINE, SQUARE]

async function run(testMode) {
  const moves = await getData(testMode)
  let result = addNRocks(2022, [], moves)
  console.log(`Board Height ${result.board.length}`)
  let part2Height = addNRocksPart2(1000000000000, moves)
  console.log(`Board Height ${part2Height}`)
}

function addNRocksPart2(numRocks, moves){
  // See comments below in addNRocks for where these numbers come from.
  const CYCLE_START = 2048
  const CYCLE_LENGTH = 1715
  const CYCLE_HEIGHT = 2690
  
  if(numRocks < CYCLE_START){
    return addNRocks(numRocks, board, moves)
  }
  let result = addNRocks(CYCLE_START, [], moves)
  let height = result.board.length // height at row 2048
  let numMultiples = Math.floor((numRocks-CYCLE_START)/CYCLE_LENGTH)
  height += numMultiples*CYCLE_HEIGHT
  // now to calculate the remaining rows.
  let numRemainingRows = (numRocks-CYCLE_START) % CYCLE_LENGTH
  console.log(numRemainingRows, height)
  if(numRemainingRows > 0){
    let board = result.board.slice(0, 70) // remove the reundant board leaving enough of the board so that we can continue on for the last few rows.
    let startHeight = board.length
    let result2 = addNRocks(numRemainingRows, board, moves, result.moveIndex, CYCLE_START%ORDER.length)
    height += result2.board.length - startHeight  
  }
  return height
}

function addNRocks(numRocks, board, moves, moveIndex = 0, rockIndex = 0){
  // let mostMoves = 0
  // let lastMostMoves = 0
  // let heightAtMostMoves = 0
  for(let i=0;i<numRocks;i++){
    let result = addRock(ORDER[(i+rockIndex)%ORDER.length], moveIndex, board, moves)
    board = result.board
    moveIndex = (moveIndex + result.numMoves) % moves.length
    // using below commented out code have found that the max number of moves is 67 and it happens every 1715 rocks from rock 2048 onwards
    // so after calculating the first 2048 rows, can then figure out the 1715 height gap across 1715 and fast forward to the end.
    // each 1715 cycle changes in height by 2690 positions.
    // at 2048th row the height is 3242.
    // if(mostMoves <= result.numMoves){
    //   mostMoves = result.numMoves
    //   console.log('New Most Moves', mostMoves,'at',i, i-lastMostMoves, board.length, board.length-heightAtMostMoves)
    //   heightAtMostMoves = board.length
    //   lastMostMoves = i
    // }
    if(i%10000 === 0 && i > 0){
      console.log(i, (i/numRocks) * 100)
    }
  }
  // console.log('Most Moves', mostMoves)
  // printBoard(board)
  return {moveIndex, board}
}

function addRock(rock, moveIndex, board, moves){
  let curRockPos = {x: 2, y: 0}
  let numMoves =0 
  board = addRockToBoard(rock, board)
  // printBoard(board)
  while(true){
    let nextMove = moves[(moveIndex+numMoves)%moves.length]
    curRockPos = moveRock(nextMove, rock, curRockPos, board)
    numMoves++
    let oldRockPos = {...curRockPos}
    curRockPos = dropRock(rock, curRockPos, board)
    if(curRockPos.x === oldRockPos.x && curRockPos.y === oldRockPos.y){
      break
    }
  }
  board = turnRockToStone(rock, curRockPos, board)
  board = removeEmptyRowsAtTop(board)
  return {numMoves, board}
}

function getNewRow(){
  return (new Array(7)).fill('.')
}

function dropRock(rock, curRockPos, board){
  if(isRockBlocked(rock, curRockPos, board)){
    return curRockPos
  }
   // unset current pos
   for(let part of rock){
    board[curRockPos.y + part.y][curRockPos.x + part.x] = '.'
  }
  // set new pos
  for(let part of rock){
    board[curRockPos.y + part.y + 1][curRockPos.x + part.x] = '@'
  }
  return {x: curRockPos.x, y: curRockPos.y + 1}
}

function moveRock(move, rock, curRockPos, board){
  let xMove = getRockMoveByX(move, rock, curRockPos, board)
  if(xMove != 0){
    // unset current pos
    for(let part of rock){
      board[curRockPos.y + part.y][curRockPos.x + part.x] = '.'
    }
    // set new pos
    for(let part of rock){
      board[curRockPos.y + part.y][curRockPos.x + part.x + xMove] = '@'
    }
    return {x: curRockPos.x+xMove, y: curRockPos.y}
  }
  return curRockPos
}

function getRockMoveByX(move, rock, curRockPos, board){
   // check if can move
   let xMove = 0
   if(move === '>'){
     xMove = 1
   } else {
     xMove = -1
   }
   for(let part of rock){
     let newPartX = curRockPos.x + xMove + part.x
     if(newPartX < 0 || newPartX >= 7){
      return 0 // can't move
     } else if(board[curRockPos.y + part.y][newPartX] === '#'){
      return 0 // can't move
     }
   }
   return xMove
}

function turnRockToStone(rock, curRockPos, board){
  for(let part of rock){
    board[curRockPos.y + part.y][curRockPos.x + part.x] = '#'
  }
  return board
}

function addRockToBoard(rock, board){
  let yMax = 0
  for(let part of rock){
    if(part.y > yMax) yMax = part.y
  }
  let rows = []
  for(let i =0; i <= yMax; i++){
    rows.push(getNewRow())
  }
  for(let part of rock){
    rows[part.y][part.x+2] = '@'
  }
  return rows.concat([getNewRow(),getNewRow(),getNewRow()], board)
}

function removeEmptyRowsAtTop(board){
  while(board[0].join('') === '.......'){
    board.shift()
  }
  return board
}

function printBoard(board){
  for(let y = 0; y < board.length; y++){
    console.log(`|${board[y].join('')}|`)
  }
  console.log('+-------+\n')
}

function isRockBlocked(rock, curRockPos, board){
  for(let part of rock){
    if(curRockPos.y + part.y === board.length -1){
      return true
    } else if(board[curRockPos.y+part.y+1][part.x + curRockPos.x] === '#'){
      return true
    }
  }
  return false
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 17, isTest)
  let moves = []
  for(let line of lines){
    moves = [...moves].concat(line.split(''))
  }
  return moves
 }

export {run}
