async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  const allSeries = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    allSeries.push(line.split(' ').map(n => parseInt(n)))
  }
  return { allSeries }
}

function part1({ allSeries } = {}) {
  return allSeries.reduce((acc, series) => {
    return acc + getNextInSeries([...series])
  }, 0)
}

function part2({ allSeries } = {}) {
  return allSeries.reduce((acc, series) => {
    return acc + getPrevInSeries([...series])
  }, 0)
}

function getNextInSeries(series){
  const seriesTree = getSeriesTree(series)
  for(let i = seriesTree.length - 2; i >= 0; i--){
    let curLast = seriesTree[i][seriesTree[i].length-1]
    let nextLast = seriesTree[i+1][seriesTree[i+1].length-1]
    seriesTree[i].push(curLast + nextLast)
  }
  return seriesTree[0][seriesTree[0].length-1]
}

function getPrevInSeries(series){
  const seriesTree = getSeriesTree(series)
  for(let i = seriesTree.length - 2; i >= 0; i--){
    let curFirst = seriesTree[i][0]
    let nextFirst = seriesTree[i+1][0]
    seriesTree[i].unshift(curFirst - nextFirst)
  }
  return seriesTree[0][0]
}

function getSeriesTree(series){
  const seriesTree = [[...series]]
  while(true){
    let reducedSeries = reduceSeries(seriesTree[seriesTree.length-1])
    seriesTree.push(reducedSeries)
    if(reducedSeries.length === 1 || reducedSeries.length === reducedSeries.filter(n => n === 0).length){
      break
    }
  }
  return seriesTree
}

function reduceSeries(series){
  const newSeries = []
  for(let i = 0; i < series.length - 1; i++){
    newSeries.push(series[i+1] - series[i])
  }
  return newSeries
}

export { run }