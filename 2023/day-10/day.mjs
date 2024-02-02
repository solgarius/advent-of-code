async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  const pipeMap = []
  let startPos = null
  // surround map with ground to avoid wrap over edge
  for (let i = 0; i < lines.length; i++) {
    lines[i] = '.' + lines[i] + '.'
  }
  lines.unshift('.'.repeat(lines[0].length))
  lines.push('.'.repeat(lines[0].length))
  // split out the lines and map to base nodes
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y]
    const chars = line.split('')
    const row = []
    for (let x = 0; x < chars.length; x++) {
      const c = chars[x]
      let node = { c, x, y, conns: [] }
      if (c === 'S') {
        startPos = { x, y }
      }
      row.push(node)
    }
    pipeMap.push(row)

  }
  // map the connections into the nodes - can skip the sides as there will be no conns there.
  for (let y = 1; y < pipeMap.length - 1; y++) {
    for (let x = 1; x < pipeMap[y].length - 1; x++) {
      const { c, conns } = pipeMap[y][x]
      if (c === '|') {
        conns.push(pipeMap[y - 1][x])
        conns.push(pipeMap[y + 1][x])
      } else if (c === '-') {
        conns.push(pipeMap[y][x - 1])
        conns.push(pipeMap[y][x + 1])
      } else if (c === 'L') {
        conns.push(pipeMap[y - 1][x])
        conns.push(pipeMap[y][x + 1])
      } else if (c === 'J') {
        conns.push(pipeMap[y - 1][x])
        conns.push(pipeMap[y][x - 1])
      } else if (c === '7') {
        conns.push(pipeMap[y][x - 1])
        conns.push(pipeMap[y + 1][x])
      } else if (c === 'F') {
        conns.push(pipeMap[y][x + 1])
        conns.push(pipeMap[y + 1][x])
      }
    }
  }
  // need to figure out the letter for start pos based on adjacent connections.
  let startNode = pipeMap[startPos.y][startPos.x]
  let dirs = {}
  for (let y = startPos.y - 1; y <= startPos.y + 1; y++) {
    for (let x = startPos.x - 1; x <= startPos.x + 1; x++) {
      let node = pipeMap[y][x]
      for (let conn of node.conns) {
        if (conn === startNode) {
          startNode.conns.push(node)
          if(y === startPos.y - 1){
            dirs.up = true
          } else if(y === startPos.y + 1){
            dirs.down = true
          } else if (x === startPos.x - 1){
            dirs.left = true
          } else if (x === startPos.x + 1){
            dirs.right = true
          }
          break
        }
      }
    }
  }
  if(dirs.up && dirs.left){
    startNode.c = 'J'
  } else if(dirs.up && dirs.right){
    startNode.c = 'L'
  } else if(dirs.down && dirs.left){
    startNode.c = '7'
  } else if(dirs.down && dirs.right){
    startNode.c = 'F'
  } else if(dirs.up){
    startNode.c = '|'
  } else if(dirs.left){
    startNode.c = '-'
  }

  return { pipeMap, startNode }
}

function part1({ startNode } = {}) {
  let steps = augmentMap(startNode)
  return Math.round(steps / 2)
}

function part2({ pipeMap, startNode } = {}) {
  augmentMap(startNode)
  const expandedMap = getExpandedMap(pipeMap)
  markOuterNodes(expandedMap, {x:0,y:0})
  printCleanMap(pipeMap)
  let insideCount = 0
  for(let row of pipeMap){
    for (let node of row){
      if(!node.loop && !node.outside){
        insideCount++
      }
    }
  }
  return insideCount
}

function augmentMap(startNode) {
  let curNode = startNode.conns[0]
  let prevNode = startNode
  let steps = 0
  while (curNode !== startNode) {
    steps++
    curNode.step = steps
    curNode.loop = true
    if (curNode.conns[0] === prevNode) {
      prevNode = curNode
      curNode = curNode.conns[1]
    } else {
      prevNode = curNode
      curNode = curNode.conns[0]
    }
  }
  return steps
}

function printCleanMap(pipeMap) {
  for (let row of pipeMap) {
    let s = ''
    for (let node of row) {
      if(node.loop){
        s += getChar(node.c)
      } else if(node.outside){
        s += 'O'
      } else {
        s += 'I'
      }
    }
    console.log(s)
  }
}

function getChar(c){
  if( c === 'L'){
    return '└'
  } else if(c === 'J'){
    return '⌟'
  } else if(c === 'F'){
    return '┌'
  } else if(c === '7'){
    return '⌝'
  }
  return c
}

function getExpandedMap(pipeMap){
  // takes the pipe map and splits it into 9 segments per node with the 
  // pipe (conns) marked as walls and reference back to the parent node.
  // this allows for a simple path finding algorithm to be used.
  const expandedMap = []
  for (let y = 0; y < pipeMap.length; y++) {
    const row1 = []
    const row2 = []
    const row3 = []
    for (let x = 0; x < pipeMap[y].length; x++) {
      const parent = pipeMap[y][x]
      if(parent.c === '|'){
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '#', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '.', x:x*3, y:y*3+1, parent }, { c: '#', x:x*3+1, y:y*3+1, parent }, { c: '.', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '#', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      } else if(parent.c === '-'){
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '.', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '#', x:x*3, y:y*3+1, parent }, { c: '#', x:x*3+1, y:y*3+1, parent }, { c: '#', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '.', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      } else if(parent.c === 'L'){
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '#', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '.', x:x*3, y:y*3+1, parent }, { c: '#', x:x*3+1, y:y*3+1, parent }, { c: '#', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '.', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      } else if(parent.c === 'J'){
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '#', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '#', x:x*3, y:y*3+1, parent }, { c: '#', x:x*3+1, y:y*3+1, parent }, { c: '.', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '.', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      } else if(parent.c === '7'){
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '.', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '#', x:x*3, y:y*3+1, parent }, { c: '#', x:x*3+1, y:y*3+1, parent }, { c: '.', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '#', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      } else if(parent.c === 'F'){
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '.', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '.', x:x*3, y:y*3+1, parent }, { c: '#', x:x*3+1, y:y*3+1, parent }, { c: '#', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '#', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      } else {
        row1.push({ c: '.', x:x*3, y:y*3, parent }, { c: '.', x:x*3+1, y:y*3, parent }, { c: '.', x:x*3+2, y:y*3, parent })
        row2.push({ c: '.', x:x*3, y:y*3+1, parent }, { c: '.', x:x*3+1, y:y*3+1, parent }, { c: '.', x:x*3+2, y:y*3+1, parent })
        row3.push({ c: '.', x:x*3, y:y*3+2, parent }, { c: '.', x:x*3+1, y:y*3+2, parent }, { c: '.', x:x*3+2, y:y*3+2, parent })
      }
    }
    expandedMap.push(row1)
    expandedMap.push(row2)
    expandedMap.push(row3)
  }
  return expandedMap;
}

function markOuterNodes(expandedMap, startPos){
  const nodes = []
  const visited = new Set()
  const startNode = expandedMap[startPos.y][startPos.x]
  nodes.push(startNode)
  while(nodes.length > 0){
    const node = nodes.shift()
    if(visited.has(node)){
      continue
    }
    visited.add(node)
    node.parent.outside = true
    const { x, y } = node
    const neighbors = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 }
    ]
    for (const neighbor of neighbors) {
      const neighborNode = expandedMap[neighbor.y]?.[neighbor.x]
      if (neighborNode && !visited.has(neighborNode) && neighborNode.c === '.') {
        nodes.push(neighborNode)
      }
    }
  }
}

export { run }