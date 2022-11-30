import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

const NUL_CHAR = null

async function run(testMode) {
  let board = await getData(testMode)
  let openBoards = {[board.getSimpleStr()]: board}
  let bestBoards = {[board.getSimpleStr()]: board.getScore()}
  let lowestEnergy = Number.MAX_SAFE_INTEGER
  let loops = 0
  while (_.keys(openBoards).length > 0) {
    if (loops % 1000 === 0) {
      console.log(loops, 'len', _.keys(openBoards).length, 'energy', lowestEnergy)
      // _.each(openBoards, board => {
      //   console.log(boardToString(board))
      // })
    }
    loops++
    let curBoard = getNextBoard(openBoards)
    delete openBoards[curBoard.getSimpleStr()]
    let score = curBoard.getScore()
    if (score < lowestEnergy) {
      if (curBoard.isComplete()) {
        lowestEnergy = score
      }
      const moves = curBoard.getPossibleMoves()
      _.each(moves, move => {
        let curScore = curBoard.getScore()
        curScore += move.energy
        if (curScore > lowestEnergy) {
          return
        }
        const newBoard = _.cloneDeep(curBoard)
        newBoard.doMove(move)
        let newBoardKey = newBoard.getSimpleStr()
        let newBoardScore = newBoard.getScore()

        if (bestBoards[newBoardKey] == null || bestBoards[newBoardKey] > newBoardScore) {
          openBoards[newBoardKey] = newBoard
          bestBoards[newBoardKey] = newBoardScore
        }
      })
    }
  }
  console.log(loops, 'len', _.keys(openBoards).length, 'energy', lowestEnergy)
}

function getNextBoard(boards) {
  let mostEnergy = null
  _.each(boards, board => {
    if (!mostEnergy || mostEnergy.getScore() < board.getScore()) {
      mostEnergy = board
    }
  })
  return mostEnergy
}

function getMove(fromType, fromIndex, toType, toIndex, roomSize, amphipodType) {
  const move = {ft: fromType, fidx: fromIndex, tidx: toIndex}
  move.steps = getStepsFromMove(move, roomSize)
  move.energy = getEnergyUsed(amphipodType, move.steps)
  return move
}

class Board {
  constructor(hallway, rooms) {
    this.rooms = rooms
    this.hallway = hallway
    this.energyUsed = 0
    this.bigRooms = this.rooms.length > 8
    this.roomSize = this.bigRooms ? 4 : 2
  }

  isComplete() {
    let rChar = _.map(this.rooms, asChar).join('')
    return rChar === (this.roomSize === 4 ? 'AAAABBBBCCCCDDDD' : 'AABBCCDD')
  }

  getSimpleStr() {
    let rChar = _.map(this.rooms, asChar).join('')
    let hChar = _.map(this.hallway, asChar).join('')
    return rChar + hChar
  }

  getScore() {
    return this.energyUsed
  }

  getRoomOccupants(room) {
    const roomSize = this.roomSize
    return this.rooms.slice(roomSize * room, roomSize * room + roomSize)
  }

  doMove(move) {
    const fArr = move.ft === 'h' ? this.hallway : this.rooms
    const tArr = move.ft === 'h' ? this.rooms : this.hallway
    const amphipod = fArr[move.fidx]
    fArr[move.fidx] = null
    tArr[move.tidx] = amphipod
    this.energyUsed += move.energy
  }

  getPossibleMoves() {
    let moves = []
    // from each room see if any amphipods need to leave the room and wait in hallway.
    for (let rIndex = 0; rIndex < this.rooms.length; rIndex++) {
      let amphi = this.rooms[rIndex]
      let {room, roomPos} = getRoomAndPos(rIndex, this.roomSize)
      let occupants = this.getRoomOccupants(room)
      if (amphi && couldLeaveRoom(room, roomPos, occupants)) {
        // wrong room and can move (top of room or not blocked)
        let hPos = getRoomPositionInHallway(room)
        // check move left
        for (let hIndex = hPos - 1; hIndex >= 0; hIndex--) {
          if (this.hallway[hIndex]) {
            // something blocking
            break
          }
          if (canStopHallway(hIndex)) {
            moves.push(getMove('r', rIndex, 'h', hIndex, this.roomSize, amphi))
          }
        }
        // check move right
        for (let hIndex = hPos + 1; hIndex < this.hallway.length; hIndex++) {
          if (this.hallway[hIndex]) {
            // something blocking
            break
          }
          if (canStopHallway(hIndex)) {
            moves.push(getMove('r', rIndex, 'h', hIndex, this.roomSize, amphi))
          }
        }
      }
    }
    // starting with hallway try all possible moves.
    for (let hIndex = 0; hIndex < this.hallway.length; hIndex++) {
      let amphi = this.hallway[hIndex]
      const {steps, pos: roomPos} = this.getStepsToRoom(amphi, hIndex)
      if (steps) {
        let room = getRoom(amphi)
        let rIndex = getRoomIndex(room, roomPos, this.roomSize)
        moves.push(getMove('h', hIndex, 'r', rIndex, this.roomSize, amphi))
      }
    }
    return _.sortBy(moves, m=> -m.energy)
  }

  getStepsToRoom(amphipod, curHPos) {
    if (!amphipod) {
      return {steps: 0}
    }
    const room = getRoom(amphipod)
    // does room only have correct type amphipod
    const occupants = this.getRoomOccupants(room)
    const destRoomPos = _.lastIndexOf(occupants, NUL_CHAR)
    if (destRoomPos < occupants.length - 1) {
      // room is not empty, check if other occupants are same type.
      const wrongOccupant = anyWrongRoommates(occupants, amphipod)
      if(wrongOccupant){
        return {steps: 0}
      }
    }
    const roomHPos = getRoomPositionInHallway(room)
    const lowPos = Math.min(roomHPos, curHPos)
    const highPos = Math.max(roomHPos, curHPos)
    for (let i = lowPos; i <= highPos; i++) {
      if (this.hallway[i] && this.hallway[i] !== amphipod) {
        return {steps: 0}
      }
    }
    return {steps: (highPos - lowPos) + destRoomPos + 1, pos: destRoomPos}
  }

}

function canStopHallway(hPos) {
  return (hPos !== 2 && hPos !== 4 && hPos !== 6 && hPos !== 8)
}

function getRoomPositionInHallway(room) {
  return 2 + 2 * room
}

function getRoomAndPos(rIndex, roomSize) {
  let room = Math.floor(rIndex / roomSize)
  let roomPos = rIndex % roomSize
  return {room, roomPos}
}

function getRoomIndex(room, roomPos, roomSize) {
  return roomSize * room + roomPos
}

function anyWrongRoommates(occupants, amphipod){
  return !!_.find(occupants, occupant => (occupant && occupant !== amphipod))
}

function couldLeaveRoom(room, roomPos, occupants) {
  let self = occupants[roomPos]
  // is incorrect room or blocking and not blocked themselves
  let wrongRoom = getRoom(self) !== room
  let wrongRoommate = anyWrongRoommates(occupants, self)
  let firstOccupant = _.lastIndexOf(occupants, NUL_CHAR) + 1
  let blocked = roomPos > firstOccupant
  return (wrongRoom || wrongRoommate) && !blocked
}

function getRoom(type) {
  return type.charCodeAt(0) - 'A'.charCodeAt(0)
}

function getEnergyUsed(type, moves) {
  if (type === 'A') {
    return moves
  }
  if (type === 'B') {
    return moves * 10
  }
  if (type === 'C') {
    return moves * 100
  }
  if (type === 'D') {
    return moves * 1000
  }
  return 0
}

function getStepsFromMove(move, roomSize) {
  const roomIndex = move.ft === 'r' ? move.fidx : move.tidx
  const {room, roomPos} = getRoomAndPos(roomIndex, roomSize)
  const hIndex = move.ft === 'h' ? move.fidx : move.tidx
  const roomHIndex = getRoomPositionInHallway(room)
  return Math.abs(roomHIndex - hIndex) + roomPos + 1
}

// function boardToString(board) {
//   const hallwayChar = _.map(board.hallway, asChar)
//   const roomChar = _.map(board.rooms, asChar)
//   if (board.bigRooms) {
//     return [
//       `#############`,
//       `#${hallwayChar.join('')}#`,
//       `###${roomChar[0]}#${roomChar[4]}#${roomChar[8]}#${roomChar[12]}###`,
//       `  #${roomChar[1]}#${roomChar[5]}#${roomChar[9]}#${roomChar[13]}#  `,
//       `  #${roomChar[2]}#${roomChar[6]}#${roomChar[10]}#${roomChar[14]}#  `,
//       `  #${roomChar[3]}#${roomChar[7]}#${roomChar[11]}#${roomChar[15]}#  `,
//       `  #########`
//     ]
//   }
//   return [
//     `#############`,
//     `#${hallwayChar.join('')}#`,
//     `###${roomChar[0]}#${roomChar[2]}#${roomChar[4]}#${roomChar[6]}###`,
//     `  #${roomChar[1]}#${roomChar[3]}#${roomChar[5]}#${roomChar[7]}#  `,
//     `  #########`
//   ]
// }

function asChar(amphipod) {
  return amphipod || '.'
}

function stringToBoard(lines) {
  let hallway = (new Array(11)).fill(null)
  let rooms
  if (lines.length === 5) {
    rooms = [
      lines[2][3], lines[3][3],
      lines[2][5], lines[3][5],
      lines[2][7], lines[3][7],
      lines[2][9], lines[3][9]
    ]
  } else {
    rooms = [
      lines[2][3], lines[3][3], lines[4][3], lines[5][3],
      lines[2][5], lines[3][5], lines[4][5], lines[5][5],
      lines[2][7], lines[3][7], lines[4][7], lines[5][7],
      lines[2][9], lines[3][9], lines[4][9], lines[5][9]
    ]
  }
  return new Board(hallway, rooms)
}

async function getData(isTest) {
  let filename = `./day-23/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  return stringToBoard(lines)

}

export {run}