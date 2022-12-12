import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const heightMap = await getData(testMode)
  let routeLength = getShortestRoute(_.cloneDeep(heightMap))
  console.log(`Length: ${routeLength}`)
  // get shortest route for any 'a'
  // first remove the 'S' from the heightMap
  removeS(heightMap)
  let allStartPoints = findAllStartPoints(heightMap)
  let shortestRoute = Number.MAX_SAFE_INTEGER
  console.log(`Num points to check ${allStartPoints.length}`)
  for(let startPoint of allStartPoints){
    heightMap[startPoint[0]][startPoint[1]] = 'S'
    routeLength = getShortestRoute(_.cloneDeep(heightMap))
    if(routeLength > 0 && routeLength < shortestRoute){
      shortestRoute = routeLength
      // console.log(`New Current Shortest ${startPoint} of ${routeLength}`)
    }
    removeS(heightMap)
  }
  console.log(`Shortest Route ${shortestRoute}`)
}

function findAllStartPoints(heightMap){
  let allStartPoints = []
  for(let y = 0; y< heightMap.length; y++){
    for(let x =0; x < heightMap[y].length; x++){
      if(heightMap[y][x] === 'a'){
        // need to find if there is an adjacent 'b' or else other 'a's in between and therefore this cannot be the shortest
        if(x>0 && heightMap[y][x-1] === 'b'){
          allStartPoints.push([y,x])
        } else if(y > 0 && heightMap[y-1][x] === 'b'){
          allStartPoints.push([y,x])
        } else if(y < heightMap.length-1 && heightMap[y+1][x] === 'b'){
          allStartPoints.push([y,x])
        } else if(x < heightMap[y].length-1 && heightMap[y][x+1] === 'b'){
        allStartPoints.push([y,x])
        }
      }
    }
  }
  return allStartPoints
}

function removeS(heightMap){
  let startPos = getMapPos(heightMap, 'S')
  heightMap[startPos[0]][startPos[1]] = 'a'
}

function getMapPos(heightMap, char){
  for(let y = 0; y< heightMap.length; y++){
    for(let x =0; x < heightMap[y].length; x++){
      if(heightMap[y][x] === char){
        return [y,x]
      }
    }
  }
}

function getShortestRoute(heightMap) {
  const nodeBoard = getNodeBoard(heightMap)
  let startPos = getMapPos(heightMap, 'S')
  let destPos = getMapPos(heightMap, 'E')
  let start = nodeBoard[startPos[0]][startPos[1]]
  let dest = nodeBoard[destPos[0]][destPos[1]]
  let result = aStar(start, dest)
  let routeLength = 0
  _.each(result || [], node => {
    if (node.str !== start.str) {
      routeLength++
    }
  })
  return routeLength

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
    for(let neighbour of currentNode.neighbours){
      const tentativeFromStartScore = fromStartScore[currentNode.str] + 1//currentNode.moveValue
      fromStartScore[neighbour.str] = fromStartScore[neighbour.str] || Number.MAX_SAFE_INTEGER
      if (tentativeFromStartScore < fromStartScore[neighbour.str]) {
        cameFrom[neighbour.str] = currentNode
        fromStartScore[neighbour.str] = tentativeFromStartScore
        toGoalScore[neighbour.str] = tentativeFromStartScore + estimateCheapestPath(neighbour, goal)
        if (!openSet[neighbour.str]) {
          openSet[neighbour.str] = neighbour
        }
      }
    }
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
    _.each(xs, (mapV, x) => {
      let v = mapV
      if(v === 'S'){ v = 'a' }
      if(v === 'E'){ v = 'z' }
      let value = v.charCodeAt(0) - 'a'.charCodeAt(0)
      // if(mapV === 'S'){ value-- }
      // if(mapV === 'E'){ value++ }
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
  constructor(x, y, value, moveValue = 1) {
    this.x = x
    this.y = y
    this.str = `${x}_${y}`
    this.value = value
    this.moveValue = moveValue
    this.neighbours = []
  }

  isEqual(otherNode) {
    return otherNode.x === this.x && otherNode.y === this.y
  }

  addNeighbours(allNodes) {
    let neighbour = null
    if (this.x > 0) {
      neighbour = allNodes[this.y][this.x - 1]
      if(canVisitNeighbour(this, neighbour)){
        this.neighbours.push(neighbour)
      }
    }
    if (this.x < allNodes[this.y].length - 1) {
      neighbour = allNodes[this.y][this.x + 1]
      if(canVisitNeighbour(this, neighbour)){
        this.neighbours.push(neighbour)
      }
    }
    if (this.y > 0) {
      neighbour = allNodes[this.y - 1][this.x]
      if(canVisitNeighbour(this, neighbour)){
        this.neighbours.push(neighbour)
      }
    }
    if (this.y < allNodes.length - 1) {
      neighbour = allNodes[this.y + 1][this.x]
      if(canVisitNeighbour(this, neighbour)){
        this.neighbours.push(neighbour)
      }
    }
  }
}

function canVisitNeighbour(thisNode, neighbourNode){
  let aVal = thisNode.value
  let bVal = neighbourNode.value
  return (bVal - aVal) <= 1
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 12, isTest)
  let map = []
  for(let line of lines){
    map.push(line.split(''))
  }
  return map
 }

export {run}
