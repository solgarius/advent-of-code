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
  let maxSteps = 3
  for (let node of nodes1d) {
    node.neighbours = getNeighbours(node, nodes, maxSteps)
  }
  let distances = dijkstra(nodes1d, nodes[0][0])
  return distances.getLowest(nodes[nodes.length - 1][nodes[0].length - 1], maxSteps).distance
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

  get(node, direction, steps) {
    return this.distances[getKey(node, direction, steps)] || { distance: Infinity }
  }

  getLowest(node, direction = null, maxSteps = 3) {
    let lowest = null
    for (let steps = 0; steps < maxSteps; steps++) {
      let v = direction !== HORIZONTAL ? this.get(node, VERTICAL, steps) : { distance: Infinity }
      let h = direction !== VERTICAL ? this.get(node, HORIZONTAL, steps) : { distance: Infinity }
      if (!lowest || v.distance < lowest.distance) lowest = v
      if (!lowest || h.distance < lowest.distance) lowest = h
    }
    return lowest || { distance: Infinity }
  }

  set(node, direction, steps, distance) {
    this.distances[getKey(node, direction, steps)] = { distance, node, direction, steps }
  }
}

class Visited {
  constructor() {
    this.visited = new Set()
  }

  add(node, direction, steps) {
    this.visited.add(getKey(node, direction, steps))
  }

  has(node, direction, steps) {
    this.visited.has(getKey(node, direction, steps))
  }

}

function getKey(node, direction, steps) {
  return `${node.key}_${direction}_${steps}`
}

function dijkstra(nodesInput, start) {
  const numSteps = 3
  let nodes = [...nodesInput] // TODO expand out nodes to be all possible numSteps away.

  const distances = new Distances()

  // A set to keep track of all visited nodes
  let visited = new Visited();

  // Initially, set the shortest distance to every node as Infinity
  for (let node of nodes) {
    for (let steps = 1; steps <= numSteps; steps++) {
      let initialValue = node === start ? 0 : Infinity
      distances.set(node, VERTICAL, steps, initialValue)
      distances.set(node, HORIZONTAL, steps, initialValue)
    }
  }
  // Loop until all nodes are visited
  while (nodes.length) {
    // Sort nodes by distance and pick the closest unvisited node
    nodes.sort((a, b) => {
      return distances.getLowest(a).distance - distances.getLowest(b).distance
    });
    let closestNode = nodes.shift();
    for (let fromDirection of [VERTICAL, HORIZONTAL]) {
      for (let step = 1; step <= numSteps; step++) {

        // If the shortest distance to the closest node is still Infinity, then remaining nodes are unreachable and we can break
        let closestNodeDist = distances.get(closestNode, fromDirection, step)
        if (closestNodeDist.distance === Infinity) break;

        // Mark the chosen node as visited
        visited.add(closestNode, fromDirection, step);

        // For each neighboring node of the current node
        for (let neighbour of closestNode.neighbours[fromDirection]) {
          // If the neighbor hasn't been visited yet
          if (!visited.has(neighbour, fromDirection, step)) {
            // Calculate tentative distance to the neighboring node
            let newDistance = closestNodeDist.distance + neighbour.value;

            // If the newly calculated distance is shorter than the previously known distance to this neighbor
            if (newDistance < distances.get(neighbour, fromDirection, step).distance) {
              // Update the shortest distance to this neighbor
              distances.set(neighbour, fromDirection, step, newDistance);
            }
          }
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
    neighbours.push(getNeighbourNode(nodes, node, VERTICAL, -steps))
    neighbours.push(getNeighbourNode(nodes, node, HORIZONTAL, -steps))
    neighbours.push(getNeighbourNode(nodes, node, VERTICAL, +steps))
    neighbours.push(getNeighbourNode(nodes, node, HORIZONTAL, +steps))
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
  let dist = to.value
  while (true) {
    if (row < fromNode.row) {
      row++
    } else if( row > fromNode.row){
      row--
    }
    if (col < fromNode.col) {
      col++
    } else if( col > fromNode.col){
      col--
    }
    if(row === fromNode.row && col === fromNode.col) break
    dist += nodes[row][col].value
  }
  return { from: fromNode, to, dist, steps, dir }
}


export { run }
