import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  let board = await getData(testMode)
  moveUntilStuck(_.cloneDeep(board))
}

function moveUntilStuck(board) {
  let numMoved = 0
  let totalNumMoves = 0
  let numRounds = 0
  console.log(boardAsStr(board))
  do {
    numMoved = moveEast(board)
    numMoved += moveSouth(board)
    numRounds++
    if(numRounds % 100 === 0){
      console.log(boardAsStr(board), numRounds, numMoved)
    }
    totalNumMoves += numMoved
  } while (numMoved > 0)
  console.log(boardAsStr(board), numRounds, totalNumMoves)
}

function boardAsStr(board) {
  return _.map(board, row => row.join('')).join('\n')
}

function moveEast(board) {
  let moves = []

  for (let y = 0; y < board.length; y++) {
    let row = board[y]
    for (let x = 0; x < row.length; x++) {
      let nextIndex = x === row.length - 1 ? 0 : x + 1
      if (row[x] === '>' && row[nextIndex] === '.') {
        moves.push({y, x, n: nextIndex})
      }
    }
  }
  _.each(moves, ({x, y, n}) => {
    board[y][x] = '.'
    board[y][n] = '>'
  })
  return moves.length
}

function moveSouth(board) {
  let moves = []
  for (let y = 0; y < board.length; y++) {
    let row = board[y]
    for (let x = 0; x < row.length; x++) {
      let nextIndex = y === board.length - 1 ? 0 : y + 1
      if (row[x] === 'v' && board[nextIndex][x] === '.') {
        moves.push({x, y, n: nextIndex})
      }
    }
  }
  _.each(moves, ({x, y, n}) => {
    board[y][x] = '.'
    board[n][x] = 'v'
  })
  return moves.length
}

async function getData(isTest) {
  let filename = `./day-25/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  return _.map(lines, l => l.split(''))
}

export {run}