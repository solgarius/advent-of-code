const NORTH = 1
const WEST = 2
const SOUTH = 3
const EAST = 4

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  const walls = []
  const mirror = []
  for(let row = 0; row < lines.length; row++) {
    mirror.push(lines[row].split(''))
    for(let col = 0; col < lines[row].length; col++) {
      if(lines[row][col] === '#') {
        walls.push([row, col])
      }
    }
  }
  // surround the mirror with walls
  const rows = mirror.length
  const cols = mirror[0].length
  for(let i = 0; i < rows; i++) {
    walls.push([i, -1])
    walls.push([i, cols])
  }
  for(let i = 0; i < cols; i++) {
    walls.push([-1, i])
    walls.push([rows, i])
  }
  return { walls, mirror }
}

function part1({ walls, mirror } = {}) {
    moveRocks(walls, mirror, NORTH)
    return getScore(mirror)
}

function part2({ walls, mirror  } = {}) {
  let spinCount = 1000000000
  let mirrorSeenAtLoop = {}
  let jumped = false
  for(let i = 0; i < spinCount; i++) {
    moveRocks(walls, mirror, NORTH)
    moveRocks(walls, mirror, WEST)
    moveRocks(walls, mirror, SOUTH)
    moveRocks(walls, mirror, EAST)
    let mirrorStr = getMirrorString(mirror)
    if(mirrorSeenAtLoop[mirrorStr] != null && !jumped) {
      let loopLen = i - mirrorSeenAtLoop[mirrorStr]
      console.log(`loop found at ${i} with loop len ${loopLen}`)
      i += Math.floor((spinCount - i) / loopLen) * loopLen
      console.log(`jumping to ${i}`)
      jumped = true
    }
    mirrorSeenAtLoop[mirrorStr] = i
  }
  return getScore(mirror)
}

function moveRocks(walls, mirror, direction) {
  const rows = mirror.length;
  const cols = mirror[0].length;

  //for each wall, find how many rocks there are until the next wall or the edge in the direction then stack the rocks next to the wall
  // let sideWalls = getSideWalls(rows, cols, direction)
  // for(const wall of sideWalls) {
  //   moveToWall(mirror, wall, direction)
  // }
  for (const wall of walls) {
    moveToWall(mirror, wall, direction)
  }
}

function moveToWall(mirror, wall, direction) {
  const rows = mirror.length;
  const cols = mirror[0].length;
  let rockCount = 0;
  let newPos = getNextPosition(wall, direction);
  let [row, col] = newPos;
  while (row >= 0 && col >= 0 && row < rows && col < cols && mirror[row][col] !== '#') {
    if(mirror[row][col] === 'O') { 
      mirror[row][col] = '.'
      rockCount++; 
    }
    newPos = getNextPosition(newPos, direction);
    row = newPos[0]
    col = newPos[1]
  }
  newPos = getNextPosition(wall, direction);
  for (let i = 0; i < rockCount; i++) {
    mirror[newPos[0]][newPos[1]] = 'O'
    newPos = getNextPosition(newPos, direction);
  }
}

function getMirrorString(mirror) {
  let str = ''
  for(let row = 0; row < mirror.length; row++) {
    str += mirror[row].join('')
  }
  return str
}

function getNextPosition(position, direction) {
  const [row, col] = position;

  if (direction === NORTH) {
    return [row + 1, col];
  }
  if (direction === SOUTH) {
    return [row - 1, col];
  }
  if (direction === WEST) {
    return [row, col + 1];
  }
  if (direction === EAST) {
    return [row, col - 1];
  }

  return [row, col];
}

function getScore(mirror) {
  const rows = mirror.length
  let score = 0
  for(let row = 0; row < rows; row++) {
    let rowScore = rows-row
    for(let col = 0; col < mirror[row].length; col++) {
      if(mirror[row][col] === 'O') {
        score += rowScore
      }
    }
  }
  return score
}

export { run }
