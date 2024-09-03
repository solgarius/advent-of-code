import { aStar, convert2DValueArrayToAStarNodeArray } from '../../util/utility.mjs'

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  let cityBlocks = []
  for (let line of lines) {
    cityBlocks.push(line.split('').map(x => parseInt(x)))
  }
  const nodes = convert2DValueArrayToAStarNodeArray(cityBlocks)
  return { nodes }
}

function part1({ nodes } = {}) {
  let nodes1d = nodes.flat()
  let directionalNodes = []
  for (let node of nodes1d) {
    if (node.key === '0,0') {
      directionalNodes.push({ ...node })
    } else {
      directionalNodes.push({ ...node, dir: VERTICAL })
      directionalNodes.push({ ...node, dir: HORIZONTAL })
    }
  }
  let maxSteps = 3
  for (let node of directionalNodes) {
    node.neighbours = getNeighbours(node, nodes, maxSteps)
  }
  let distances = dijkstra(directionalNodes, directionalNodes[0])
  let desta = distances.get(directionalNodes[directionalNodes.length - 1]).distance
  let destb = distances.get(directionalNodes[directionalNodes.length - 2]).distance
  return Math.min(desta, destb)
}

function drawPath(path, nodes) {
  let pathSet = new Set(path.map(n => n.key))
  for (let row of nodes) {
    let str = ''
    for (let n of row) {
      if (pathSet.has(n.key)) {
        str += '.'
        continue
      }
      str += n.value
    }
    console.log(str)
  }
}


function part2({ cityBlocks } = {}) {
  // Implement part 2 logic here

  return 0;
}

const VERTICAL = 'v'
const HORIZONTAL = 'h'

class Distances {
  constructor() {
    this.distances = {}
  }

  get(node) {
    return this.distances[getKey(node)] || { distance: Infinity }
  }

  getLowest(node) {
    return this.get(node)
    // let lowest = null
    // for (let steps = 0; steps < maxSteps; steps++) {
    //   let v = direction !== HORIZONTAL ? this.get(node, VERTICAL, steps) : { distance: Infinity }
    //   let h = direction !== VERTICAL ? this.get(node, HORIZONTAL, steps) : { distance: Infinity }
    //   if (!lowest || v.distance < lowest.distance) lowest = v
    //   if (!lowest || h.distance < lowest.distance) lowest = h
    // }
    // return lowest || { distance: Infinity }
  }

  set(node, distance) {
    this.distances[getKey(node)] = { distance, node }
  }
}

class Visited {
  constructor() {
    this.visited = new Set()
  }

  add(node) {
    this.visited.add(node.key)
  }

  has(node) {
    this.visited.has(node.key)
  }

}

function getKey(node) {
  return `${node.key}_${node.dir}`
}

function dijkstra(nodesInput, start) {
  let nodes = [...nodesInput]

  const distances = new Distances()

  // A set to keep track of all visited nodes
  let visited = new Visited();

  // Initially, set the shortest distance to every node as Infinity
  for (let node of nodes) {
    let initialValue = node === start ? 0 : Infinity
    distances.set(node, initialValue)
  }
  // Loop until all nodes are visited
  while (nodes.length) {
    // Sort nodes by distance and pick the closest unvisited node
    nodes.sort((a, b) => {
      return distances.get(a).distance - distances.get(b).distance
    });
    let closestNode = nodes.shift();

    // If the shortest distance to the closest node is still Infinity, then remaining nodes are unreachable and we can break
    let closestNodeDist = distances.get(closestNode)
    if (closestNodeDist.distance === Infinity) break;

    // Mark the chosen node as visited
    visited.add(closestNode);

    // For each neighboring node of the current node
    for (let neighbour of closestNode.neighbours) {
      // If the neighbor hasn't been visited yet
      if (!visited.has(neighbour)) {
        // Calculate tentative distance to the neighboring node
        let newDistance = closestNodeDist.distance + neighbour.distance;

        // If the newly calculated distance is shorter than the previously known distance to this neighbor
        if (newDistance < distances.get(neighbour).distance) {
          // Update the shortest distance to this neighbor
          distances.set(neighbour, newDistance);
        }
      }
    }
  }


  // Return the shortest distance from the start node to all nodes
  return distances;
}

function getNeighbours(node, nodes, maxDistance = 3) {
  let neighbours = []
  for (let steps = 1; steps <= maxDistance; steps++) {
    if (node.dir !== HORIZONTAL) {
      neighbours.push(getNeighbourNode(nodes, node, HORIZONTAL, -steps))
      neighbours.push(getNeighbourNode(nodes, node, HORIZONTAL, +steps))
    }
    if (node.dir !== VERTICAL) {
      neighbours.push(getNeighbourNode(nodes, node, VERTICAL, -steps))
      neighbours.push(getNeighbourNode(nodes, node, VERTICAL, +steps))
    }
  }
  return neighbours.filter(n => n)
}

function getNeighbourNode(nodes, fromNode, dir, steps) {
  let row = fromNode.row
  let col = fromNode.col
  if (dir === VERTICAL) {
    row += steps
  } else {
    col += steps
  }
  if (row < 0 || row >= nodes.length || col < 0 || col >= nodes[0].length) return null
  let to = nodes[row][col]
  let distance = to.value
  while (true) {
    if (row < fromNode.row) {
      row++
    } else if (row > fromNode.row) {
      row--
    }
    if (col < fromNode.col) {
      col++
    } else if (col > fromNode.col) {
      col--
    }
    if (row === fromNode.row && col === fromNode.col) break
    distance += nodes[row][col].value
  }
  return { key: to.key, distance, steps, dir }
}


export { run }
