async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  let points = []
  const numRows = lines.length
  const numCols = lines[0].length
  let clearCols = new Set([...Array(numCols).keys()])
  let clearRows = new Set([...Array(numRows).keys()])


  // split out the lines and map to base nodes
  for (let row = 0; row < lines.length; row++) {
    const line = lines[row]
    for (let col = 0; col < line.length; col++) {
      const char = line[col]
      if (char === '#') {
        points.push({ col, row })
        clearCols.delete(col)
        clearRows.delete(row)
      }
    }

  }

  return { points, clearCols, clearRows }
}


function part1({ points, clearCols, clearRows } = {}) {
  let clonedPoints = JSON.parse(JSON.stringify(points)); // Deep clone the points object
  updatePointsForExpansion(clonedPoints, clearCols, clearRows)
  return getDistanceForAllPoints(clonedPoints)
}

function part2({ points, clearCols, clearRows } = {}) {
  let clonedPoints = JSON.parse(JSON.stringify(points)); // Deep clone the points object
  updatePointsForExpansion(clonedPoints, clearCols, clearRows, 1000000)
  return getDistanceForAllPoints(clonedPoints)
}

function updatePointsForExpansion(points, clearCols, clearRows, increase = 2) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    const colsBefore = Array.from(clearCols).filter((col) => col < p.col).length;
    const rowsBefore = Array.from(clearRows).filter((row) => row < p.row).length;
    p.col += colsBefore*(increase-1);
    p.row += rowsBefore*(increase-1);
  }
}

function getDistanceForAllPoints(points) {
  let totalDistance = 0
  for(let i = 0; i < points.length; i++){
    for(let j = i + 1; j < points.length; j++){
      const p1 = points[i]
      const p2 = points[j]
      const distance = Math.abs(p1.col - p2.col) + Math.abs(p1.row - p2.row)
      totalDistance += distance
    }
  }
  return totalDistance
}

export { run }
