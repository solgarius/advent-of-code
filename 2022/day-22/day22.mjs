import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'

const RIGHT = 0
const DOWN = 1
const LEFT = 2
const UP = 3


async function run(testMode) {
  const {map, code} = await getData(testMode)
  doPart(1, _.cloneDeep(map), code, testMode)
  doPart(2, _.cloneDeep(map), code, testMode)
}

function doPart(part, map, code, testMode){
  let edges = getEdges(part, testMode)
  setNextPosDirectionAtEdges(map, edges)
  let startLocation = map[0][0]
  let startX = 0
  while(!startLocation){
    startX++ 
    startLocation = map[0][startX]
  }
  startLocation.visitDir = RIGHT
  let {pos, direction} = getNewPos(startLocation, RIGHT, map, code)
  // printMap(map)
  console.log(`Part ${part}: ${(pos.y+1)*1000 + 4*(pos.x+1) + direction}`)
}

// lazily hard coding the edges for the test and real inputs.
function getEdges(part, testMode){
  let corners = {}
  let edges = []
  if(testMode){
//       a.b
//       ...
//       x.c
// s.tu.vw.d
// .........
// r.qp.on.e
//       m.fg.h
//       ......
//       l.kj.i 
    corners = {
      a: {x: 8, y: 0},
      b: {x: 11, y: 0},
      c: {x: 11, y: 3},
      d: {x: 11, y: 4},
      e: {x: 11, y: 7},
      f: {x: 11, y: 8},
      g: {x: 12, y: 8},
      h: {x: 15, y: 8},
      i: {x: 15, y: 11},
      j: {x: 12, y: 11},
      k: {x: 11, y: 11},
      l: {x: 8, y: 11},
      m: {x:8, y: 8},
      n: {x:8, y: 7},
      o: {x:7, y: 7},
      p: {x:4, y: 7},
      q: {x:3, y: 7},
      r: {x:0, y: 7},
      s: {x:0, y: 4},
      t: {x:3, y: 4},
      u: {x:4, y: 4},
      v: {x:7, y: 4},
      w: {x:8, y: 4},
      x: {x:8, y: 3}
    }
  } else {
//    a.bc.d
//    ......
//    x.gf.e
//    w.h
//    ...
//    v.i
// s.tu.j
// ......
// r.ml.k
// q.n
// ...
// p.o
    corners = {
      a: {x: 50, y: 0},
      b: {x: 99, y: 0},
      c: {x: 100, y: 0},
      d: {x: 149, y: 0},
      e: {x: 149, y: 49},
      f: {x: 100, y: 49},
      g: {x: 99, y: 49},
      h: {x: 99, y: 50},
      i: {x: 99, y: 99},
      j: {x: 99, y: 100},
      k: {x: 99, y: 149},
      l: {x: 50, y: 149},
      m: {x: 49, y: 149},
      n: {x: 49, y: 150},
      o: {x: 49, y: 199},
      p: {x: 0, y: 199},
      q: {x: 0, y: 150},
      r: {x: 0, y: 149},
      s: {x: 0, y: 100},
      t: {x: 49, y: 100},
      u: {x: 50, y: 100},
      v: {x: 50, y: 99},
      w: {x: 50, y: 50},
      x: {x: 50, y: 49}
    }
  }

  if(testMode && part === 1){
//       a.b
//       ...
//       x.c
// s.tu.vw.d
// .........
// r.qp.on.e
//       m.fg.h
//       ......
//       l.kj.i
    edges = [
      'a-b ^: l-k ^',
      'a-x <: b-c <',
      's-t ^: r-q ^',
      'u-v ^: p-o ^',
      's-r <: d-e <',
      'm-l <: h-i <',
      'g-h ^: j-i ^'
    ]
    return parseEdges(edges, corners)
  } else if(testMode && part === 2){
//       a.b
//       ...
//       x.c
// s.tu.vw.d
// .........
// r.qp.on.e
//       m.fg.h
//       ......
//       l.kj.i    
    edges = [
      'a-b ^: t-s v',
      'a-x <: u-v v',
      'b-c >: i-h <',
      's-r <: i-j ^',
      'd-e >: h-g v',
      'r-q v: k-l ^',
      'p-o v: l-m >'
    ]
    return parseEdges(edges, corners)
  } else if(part === 1){
//    a.bc.d
//    ......
//    x.gf.e
//    w.h
//    ...
//    v.i
// s.tu.j
// ......
// r.ml.k
// q.n
// ...
// p.o
    edges = [
      'a-b ^: l-k ^',
      'c-d ^: f-e ^',
      's-t ^: p-o ^',
      'a-x <: d-e <',
      'w-v <: h-i <',
      's-r <: j-k <',
      'q-p <: n-o <'
    ]
    return parseEdges(edges, corners)
  } else {
//    a.bc.d
//    ......
//    x.gf.e
//    w.h
//    ...
//    v.i
// s.tu.j
// ......
// r.ml.k
// q.n
// ...
// p.o
    edges = [
      'a-b ^: q-p >',
      'c-d ^: o-p ^',
      'a-x <: r-s >',
      'd-e >: k-j <',
      'f-e v: h-i <',
      'w-v <: s-t v',
      'l-k v: n-o <'
    ]
    return parseEdges(edges, corners)
  }
}

function parseEdges(edges, corners){
  return edges.map(edge => parseEdge(edge, corners))
}

function parseEdge(edge, corners){
  let splitEdge = edge.split(': ')
  return { 
    fromSide: parseSide(splitEdge[0], corners), 
    toSide: parseSide(splitEdge[1], corners)
  }
}

function parseSide(sideStr, corners){
  let split = sideStr.split(' ')
  let d = UP
  if(split[1] === '<') {
    d = LEFT
  } else if(split[1] === '>'){
    d = RIGHT
  } else if(split[1] === 'v'){
    d = DOWN
  }
  let c = split[0].split('-')
  return {n: sideStr, c1: corners[c[0]], c2: corners[c[1]], d}
}

function printMap(map){
  for(let y = 0; y < map.length; y++){
    let str = ''
    for(let x = 0; x < map[y].length; x++){
      let node = map[y][x]
      if(!node){
        str+= ' '
      } else if(node.wall){
        str += '#'
      } else if(node.visitDir == LEFT){
        str += '<'
      } else if(node.visitDir == RIGHT){
        str += '>'
      } else if(node.visitDir == UP){
        str += '^'
      } else if(node.visitDir == DOWN){
        str += 'v'
      } else {
        str += '.'
      }
    }
    console.log(str)
  }
}

function getNewPos(curPos, direction, map, code){
  for(let move of code){
    if(move === 'L'){
      direction = (direction + 3) % 4
    } else if(move === 'R'){
      direction = (direction + 1) % 4
    } else {
      for(let i = 0; i < move; i++){
        let next = getNext(curPos.x, curPos.y, map, direction)
        if(!next.p || next.p.wall){
          break
        }
        next.p.visitDir = next.d
        direction = next.d
        curPos = next.p
      }
    }
  }
  return {pos: curPos, direction}
}

function getIncrement(v1, v2){
  if(v1=== v2) return 0
  if(v1 > v2) return -1
  return 1
}

function setNextPosDirectionAtEdges(map, edges){
  for(let edge of edges){
    let {fromSide, toSide} = edge
    let fromXInc = getIncrement(fromSide.c1.x, fromSide.c2.x)
    let fromYInc = getIncrement(fromSide.c1.y, fromSide.c2.y)
    let toXInc = getIncrement(toSide.c1.x, toSide.c2.x)
    let toYInc = getIncrement(toSide.c1.y, toSide.c2.y)
    let fromP = {...fromSide.c1}
    let toP = {...toSide.c1}
    while(true){
      map[fromP.y][fromP.x][fromSide.d] = {p: {...toP}, d: toSide.d}
      map[toP.y][toP.x][getOppositeDirection(toSide.d)] = {p: {...fromP}, d: getOppositeDirection(fromSide.d)}
      if(fromP.x === fromSide.c2.x && fromP.y === fromSide.c2.y){
        break
      }
      fromP.x += fromXInc
      fromP.y += fromYInc
      toP.x += toXInc
      toP.y += toYInc
    }
  }
}

function getOppositeDirection(direction){
  switch(direction){
    case LEFT:
      return RIGHT
    case RIGHT:
      return LEFT
    case UP:
      return DOWN
    case DOWN:
      return UP
  }
  return direction
}

function getNext(x, y, map, direction){
  if(y == null || x == null || direction == null){
    console.log(map)
  }
  if(map[y][x][direction]){
    let newPointDetails = map[y][x][direction]
    x = newPointDetails.p.x
    y = newPointDetails.p.y
    return {p: map[y][x], d: newPointDetails.d}
  }
  let yMod = 0
  let xMod = 0
  if(direction === UP) yMod = -1
  if(direction === DOWN) yMod = 1
  if(direction === LEFT) xMod = -1
  if(direction === RIGHT) xMod = 1
  return {p: map[y+yMod][x+xMod], d: direction }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 22, isTest)
  let map = []
  let code = []
  for(let y = 0; y < lines.length-2; y++){
    let line = lines[y]
    let mapLine = line.split('').map((v, x) => {
      if(v === ' '){
        return null
      }
      return {wall: v === '#', x, y}
    })
    map.push(mapLine)
  }
  let split1 = lines[lines.length-1].match(/(\d+)[LR]?/g)
  for(let pair of split1){
    if(pair.endsWith('L') || pair.endsWith('R')){
      code.push(Number(pair.substring(0, pair.length-1)), pair.substring(pair.length-1))
    } else {
      code.push(Number(pair))
    }
  }
  return {map, code}
}

export {run}
