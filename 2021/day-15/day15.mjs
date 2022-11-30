import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const heightMap = await getHeightMap(testMode)
  getShortestRoute(_.cloneDeep(heightMap))
  const bigHeightMap = getBigHeightMap(heightMap)
  getShortestRoute(bigHeightMap)
}

function getBigHeightMap(heightMap) {
  let [yMax, xMax] = getMapSize(heightMap)
  yMax++
  xMax++
  const [bigYMax, bigXMax] = [5 * yMax, 5 * xMax]
  const bigHeightMap = new Array(bigYMax)
  for (let y = 0; y < bigYMax; y++) {
    const littleY = y % yMax
    const yMod = Math.floor(y / yMax)
    bigHeightMap[y] = new Array(bigXMax)
    for (let x = 0; x < bigXMax; x++) {
      const littleX = x % xMax
      const xMod = Math.floor(x / xMax)
      let value = xMod + yMod + heightMap[littleY][littleX]
      value = ((value-1) % 9) + 1
      bigHeightMap[y][x] = value
    }
  }
  return bigHeightMap
}

function getMapSize(array2d) {
  return [array2d.length - 1, array2d[0].length - 1]
}

function getShortestRoute(heightMap) {
  const nodeBoard = getNodeBoard(heightMap)
  let [y, x] = getMapSize(nodeBoard)
  let start = nodeBoard[0][0]
  let dest = nodeBoard[x][y]
  let result = aStar(start, dest)
  let routeLength = 0
  _.each(result || [], node => {
    if (node.str !== start.str) {
      routeLength += node.value
    }
  })
  console.log(`Length: ${routeLength}`)
}

function reconstructPath(cameFrom, currentNode, start) {
  const totalPath = [currentNode]
  while (currentNode && currentNode.str !== start.str) {
    currentNode = cameFrom[currentNode.str]
    if (currentNode) {
      totalPath.push(currentNode)
    }
  }
  return totalPath
}

function aStar(start, goal) {
  const openSet = {[start.str]: start}
  const cameFrom = {}
  const fromStartScore = {}
  fromStartScore[start.str] = 0

  const toGoalScore = {}
  toGoalScore[start.str] = estimateCheapestPath(start, goal)

  while (_.keys(openSet).length > 0) {
    let currentNode = getLowestGoalScore(openSet, toGoalScore)
    if (currentNode.isEqual(goal)) {
      return reconstructPath(cameFrom, currentNode, start)
    }
    delete openSet[currentNode.str]
    _.each(currentNode.neighbours, neighbour => {
      const tentativeFromStartScore = fromStartScore[currentNode.str] + currentNode.value
      fromStartScore[neighbour.str] = fromStartScore[neighbour.str] || Number.MAX_SAFE_INTEGER
      if (tentativeFromStartScore < fromStartScore[neighbour.str]) {
        cameFrom[neighbour.str] = currentNode
        fromStartScore[neighbour.str] = tentativeFromStartScore
        toGoalScore[neighbour.str] = tentativeFromStartScore + estimateCheapestPath(neighbour, goal)
        if (!openSet[neighbour.str]) {
          openSet[neighbour.str] = neighbour
        }
      }
    })
  }
  return null
}

function getLowestGoalScore(openSet, toGoalScore) {
  let lowestScore = Number.MAX_SAFE_INTEGER
  let lowestNode = null
  _.each(openSet, node => {
    if (toGoalScore[node.str] && toGoalScore[node.str] < lowestScore) {
      lowestNode = node
      lowestScore = toGoalScore[node.str]
    }
  })
  return lowestNode
}

function estimateCheapestPath(start, goal) {
  return ((goal.x - start.x) + (goal.y - start.y))
}

function getNodeBoard(heightMap) {
  const nodeBoard = []
  _.each(heightMap, (xs, y) => {
    nodeBoard.push([])
    _.each(xs, (value, x) => {
      nodeBoard[y].push(new Node(x, y, value))
    })
  })
  _.each(nodeBoard, (xs) => {
    _.each(xs, node => {
      node.addNeighbours(nodeBoard)
    })
  })
  return nodeBoard
}

class Node {
  constructor(x, y, value) {
    this.x = x
    this.y = y
    this.str = `${x}_${y}`
    this.value = value
    this.neighbours = []
  }

  isEqual(otherNode) {
    return otherNode.x === this.x && otherNode.y === this.y
  }

  addNeighbours(allNodes) {
    if (this.x > 0) {
      this.neighbours.push(allNodes[this.y][this.x - 1])
    }
    if (this.x < allNodes[0].length - 1) {
      this.neighbours.push(allNodes[this.y][this.x + 1])
    }
    if (this.y > 0) {
      this.neighbours.push(allNodes[this.y - 1][this.x])
    }
    if (this.y < allNodes.length - 1) {
      this.neighbours.push(allNodes[this.y + 1][this.x])
    }
  }
}

async function getHeightMap(isTest) {
  let filename = `./day-15/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  const heightMap = []
  _.each(lines, line => {
    heightMap.push(line.split('').map(n => Number(n)))
  })
  return heightMap
}

export {run}