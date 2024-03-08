import {memoize} from '../../util/utility.mjs'

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  let cave = []
  for(let line of lines) {
    cave.push(line.split(''))
  }
  return { cave }
}

function part1({ cave } = {}) {
  const caveVisits = energiseCave(cave, {row: 0, col: 0, dir: 'R'})
  return getUniqueVisitCount(caveVisits)
}

function part2({ cave  } = {}) {
  let rows = cave.length
  let cols = cave[0].length
  let mostVisits = 0
  for(let i = 0; i < rows; i++) {
    let caveVisits = energiseCave(cave, {row: i, col: 0, dir: 'R'})
    let uniqueVisitCount = getUniqueVisitCount(caveVisits)
    if(uniqueVisitCount > mostVisits) {
      mostVisits = uniqueVisitCount
    }
    caveVisits = energiseCave(cave, {row: i, col: cols-1, dir: 'L'})
    uniqueVisitCount = getUniqueVisitCount(caveVisits)
    if(uniqueVisitCount > mostVisits) {
      mostVisits = uniqueVisitCount
    }
  }  
  for(let i = 0; i < cols; i++) {
    let caveVisits = energiseCave(cave, {row: 0, col: i, dir: 'D'})
    let uniqueVisitCount = getUniqueVisitCount(caveVisits)
    if(uniqueVisitCount > mostVisits) {
      mostVisits = uniqueVisitCount
    }
    caveVisits = energiseCave(cave, {row: rows-1, col: i, dir: 'U'})
    uniqueVisitCount = getUniqueVisitCount(caveVisits)
    if(uniqueVisitCount > mostVisits) {
      mostVisits = uniqueVisitCount
    }
  }  
  return mostVisits
}

function energiseCave(cave, beamStart){
  let caveVisits = []
  for(let row of cave) {
    let newRow = []
    for(let i =0; i < row.length; i++) {
      newRow.push({ visited: false, visitCount: { U: false, D: false, L: false, R: false } })
    }
    caveVisits.push(newRow)
  }
  let beams = [ beamStart ]
  while(beams.length > 0) {
    let beam = beams.shift()
    let {row, col, dir} = beam
    if(row < 0 || row >= cave.length || col < 0 || col >= cave[row].length) {
      continue
    }
    let type = cave[row][col]
    let cell = caveVisits[row][col]
    if(cell.visitCount[dir]) {
      continue // counter infinite loops, we've already been along this path in this direction.
    }
    cell.visited = true
    cell.visitCount[dir] = true
    const up = {row: row-1, col, dir: 'U'}
    const down = {row: row+1, col, dir: 'D'}
    const left = {row, col: col-1, dir: 'L'}
    const right = {row, col: col+1, dir: 'R'}
    if(type === '|' && dir === 'U'){
      beams.push(up)
    } else if(type === '|' && dir === 'D'){
      beams.push(down)
    } else if(type === '|' && dir === 'L'){
      beams.push(up)
      beams.push(down)
    } else if(type === '|' && dir === 'R'){
      beams.push(up)
      beams.push(down)
    } else if(type === '-' && dir === 'U'){
      beams.push(left)
      beams.push(right)
    } else if(type === '-' && dir === 'D'){
      beams.push(left)
      beams.push(right)
    } else if(type === '-' && dir === 'L'){
      beams.push(left)
    } else if(type === '-' && dir === 'R'){
      beams.push(right)
    } else if(type === '/' && dir === 'U'){
      beams.push(right)
    } else if(type === '/' && dir === 'D'){
      beams.push(left)
    } else if(type === '/' && dir === 'L'){
      beams.push(down)
    } else if(type === '/' && dir === 'R'){
      beams.push(up)
    } else if(type === '\\' && dir === 'U'){
      beams.push(left)
    } else if(type === '\\' && dir === 'D'){
      beams.push(right)
    } else if(type === '\\' && dir === 'L'){
      beams.push(up)
    } else if(type === '\\' && dir === 'R'){
      beams.push(down)
    } else if(type === '.' && dir === 'U'){
      beams.push(up)
    } else if(type === '.' && dir === 'D'){
      beams.push(down)
    } else if(type === '.' && dir === 'L'){
      beams.push(left)
    } else if(type === '.' && dir === 'R'){
      beams.push(right)
    }
  }
  return caveVisits
}

function getUniqueVisitCount(caveVisits){
  let uniqueVisitCount = 0
  for(let row of caveVisits) {
    for(let cell of row) {
      uniqueVisitCount += cell.visited ? 1 : 0
    }
  }
  return uniqueVisitCount
}

export { run }
