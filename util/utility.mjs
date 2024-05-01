import {readFile} from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'

function getRootDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '..')
}

async function getLines(filename) {
  let rootDir = await getRootDir()
  const content = await readFile(path.resolve(rootDir, filename), 'UTF-8')
  return content.split(/\r?\n/);
}

async function getLinesForDay(year, day, isTest) {
  let rootDir = await getRootDir()
  let filename = `./${year}/day-${day}/${isTest ? 'dataTest.csv': 'data.csv'}`
  const content = await readFile(path.resolve(rootDir, filename), 'UTF-8')
  return content.split(/\r?\n/);
}

function memoize(func) {
  const stored = new Map();

  return (...args) => {
    const k = JSON.stringify(args);
    if (stored.has(k)) {
      return stored.get(k);
    }
    const result = func(...args);
    stored.set(k, result);
    return result;
  };
}

function convert2DValueArrayToAStarNodeArray(valueArray) {
  let nodes = []
  for(let row = 0; row < valueArray.length; row++) {
    let valueRow = valueArray[row]
    let arr = []
    nodes.push(arr)
    for(let col = 0; col < valueRow.length; col++) {
      const n = getNode(row, col, valueRow[col])
      arr.push(n)
    }
  }
  for(let row = 0; row < nodes.length; row++) {
    for(let col = 0; col < nodes[row].length; col++) {
      addNeighbours(row, col, nodes)
    }
  }
  return nodes
}

function getNode(row, col, value){
  const n = { row, col, key: `${row},${col}`, value, neighbours: [] }
  return n
}

function addNeighbours(row, col, nodes){
  let n = nodes[row][col]
  if (row > 0) {
    n.neighbours.push(nodes[row - 1][col])
  }
  if(row < nodes.length - 1) {
    n.neighbours.push(nodes[row + 1][col])
  }
  if(col > 0) {
    n.neighbours.push(nodes[row][col - 1])
  }
  if(col < nodes[0].length - 1) {
    n.neighbours.push(nodes[row][col + 1])
  }
}

function aStar(start, goal, allNodes, opts = {}) {
  const getNeighbourDistance = opts.getNeighbourDistance || (() => 1)
  const estimateCheapestPath = opts.estimateCheapestPath || ((a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col))
  const getNeighbours = opts.getNeighbours || (n => n.neighbours)
  const openSet = {[start.key]: start}
  const cameFrom = {}
  const fromStartScore = {}
  fromStartScore[start.key] = 0

  const toGoalScore = {}
  toGoalScore[start.key] = estimateCheapestPath(start, goal)
  while (Object.keys(openSet).length > 0) {
    let debug_openSetFromStart = getOpenSetScore(openSet, fromStartScore)
    let debug_opeenSetToGoal = getOpenSetScore(openSet, toGoalScore)
    let currentNode = getLowestGoalScore(openSet, toGoalScore)
    const path = reconstructPath(cameFrom, currentNode, start)
    if (currentNode.key === goal.key) {
      return path
    }
    delete openSet[currentNode.key]
    let neighbours = getNeighbours(currentNode, path)
    for(let neighbour of neighbours){
      const tentativeFromStartScore = fromStartScore[currentNode.key] + getNeighbourDistance(currentNode, neighbour)
      fromStartScore[neighbour.key] = fromStartScore[neighbour.key] || Number.MAX_SAFE_INTEGER
      if (tentativeFromStartScore < fromStartScore[neighbour.key]) {
        cameFrom[neighbour.key] = currentNode
        fromStartScore[neighbour.key] = tentativeFromStartScore 
        toGoalScore[neighbour.key] = tentativeFromStartScore + estimateCheapestPath(neighbour, goal)
        if (!openSet[neighbour.key]) {
          openSet[neighbour.key] = neighbour
        }
      }
    }
  }
  return null
}

function getOpenSetScore(openSet, scoreMap) {
  let result = {}
  for(let node of Object.values(openSet)){
    result[node.key] = scoreMap[node.key]
  }
  return result
}

function reconstructPath(cameFrom, currentNode, start) {
  const totalPath = [currentNode]
  while (currentNode && currentNode.key !== start.key) {
    currentNode = cameFrom[currentNode.key]
    if (currentNode) {
      totalPath.push(currentNode)
    }
  }
  return totalPath
}

function getLowestGoalScore(openSet, toGoalScore) {
  let lowestScore = Number.MAX_SAFE_INTEGER
  let lowestNode = null
  for(let node of Object.values(openSet)){
    if(toGoalScore[node.key] < lowestScore) {
      lowestNode = node
      lowestScore = toGoalScore[node.key]
    }
  }
  return lowestNode
}

export {getLines, getLinesForDay, memoize, aStar, convert2DValueArrayToAStarNodeArray}