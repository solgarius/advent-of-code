import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const {boards, numbersCalled} = await getBingoGames(testMode)
  const {firstWinBoard, firstWinLastNumberCalled} = getFirstWinBoard(_.cloneDeep(boards), numbersCalled)
  if (firstWinBoard) {
    const score = firstWinBoard.getScore()
    console.log(`Bingo! ${score} lasNum: ${firstWinLastNumberCalled} Score: ${firstWinLastNumberCalled * score}`)
  }
  const {lastWinBoard, lastWinLastNumberCalled} = getLastWinBoard(_.cloneDeep(boards), numbersCalled)
  if (lastWinBoard) {
    const score = lastWinBoard.getScore()
    console.log(`Bingo! ${score} lasNum: ${lastWinLastNumberCalled} Score: ${lastWinLastNumberCalled * score}`)
  }
}

function getFirstWinBoard(allBoards, numbersCalled) {
  let bingoBoard = null
  let lastNumberCalled = null
  let boards =  _.cloneDeep(allBoards)
  _.each(numbersCalled, number => {
    _.each(boards, board => {
      board.numberCalled(number)
      if (board.isBingo()) {
        bingoBoard = board
        lastNumberCalled = number
        return false // break out of each loop
      }
    })
    if (bingoBoard) {
      return false // break out of each loop
    }
  })
  return {firstWinBoard: bingoBoard, firstWinLastNumberCalled: lastNumberCalled}
}

function getLastWinBoard(allBoards, numbersCalled) {
  let lastNumberCalled = null
  let boards = _.cloneDeep(allBoards)
  _.each(numbersCalled, number => {
    lastNumberCalled = number
    let newBoards = []
    _.each(boards, board => {
      board.numberCalled(number)
      if (!board.isBingo()) {
        newBoards.push(board)
      }
    })
    if(newBoards.length === 0){
      return false
    }
    boards = newBoards
  })
  return {lastWinBoard: boards[0], lastWinLastNumberCalled: lastNumberCalled}
}

class Board {
  constructor(rows) {
    this.rows = _.cloneDeep(rows)
  }

  numberCalled(number) {
    _.each(this.rows, columns => {
      _.each(columns, (column, index) => {
        if (column === number) {
          columns[index] = null
        }
      })
    })
  }

  isBingo() {
    let bingo = false
    let colMaybeBingo = []
    _.each(this.rows, columns => {
      if (_.every(columns, col => col == null)) {
        // check for bingo across a row
        bingo = true
        return false // exit from each loop
      }
      _.each(columns, (column, index) => {
        if (colMaybeBingo.length < index) {
          // init the array, this way don't need to know how long
          // the columns are can figure out at execution time.
          colMaybeBingo.push(true)
        }
        if (column != null) {
          colMaybeBingo[index] = false
        }
      })
      if (bingo) {
        return false
      } // exit each loop
    })
    bingo = _.some(colMaybeBingo) || bingo
    return bingo
  }

  getScore() {
    return _.reduce(this.rows, (sum, columns) => {
      return sum + _.reduce(columns, (colSum, column) => {
        return colSum + column
      }, 0)
    }, 0)
  }
}


async function getBingoGames(isTest) {
  let filename = isTest ? './day-4/bingoTest.csv' : './day-4/bingo.csv'
  const lines = await getLines(filename)
  const numbersCalled = getNumbersCalled(lines[0])
  lines.shift() // remove the numbersCalled line.
  const boards = getBoards(lines)
  return {numbersCalled, boards}
}

function getNumbersCalled(line = '') {
  if (line) {
    return line.split(',').map(num => Number(num))
  }
  return []
}

function getBoards(lines) {
  let tempBoardLines = []
  let boards = []
  _.each(lines, line => {
    let lineNumbers = line.split(' ').filter(val => val.length > 0).map(num => Number(num))
    if (lineNumbers.length === 0) {
      // new line restart a board.
      if (tempBoardLines.length > 0) {
        boards.push(new Board(tempBoardLines))
      }
      tempBoardLines = []
    } else {
      tempBoardLines.push(lineNumbers)
    }
  })
  if (tempBoardLines.length > 0) {
    boards.push(new Board(tempBoardLines))
  }
  return boards
}

export {run}