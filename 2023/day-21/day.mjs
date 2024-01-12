const ROCK = '#'
const PLOT = '.'

async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  const maps = {}
  let seeds = []
  let curFrom = null
  let curTo = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (i === 0) {
      seeds = lines[i].split(':')[1].trim().split(' ').map(Number)
    } else if (/^[a-z]/i.test(line)) { // check if line starts with a-z
      const [from, x, to] = line.split(' ')[0].split('-')
      curFrom = from
      curTo = to
      maps[from] = { to, ranges: [] }
    } else if (/^\d/.test(line)) { // check if line starts with a number
      const [dst, src, range] = line.split(' ').map(Number)
      maps[curFrom].ranges.push({ dst, src, range })
    }
  }
  return { seeds, maps }
}

function part1({ seeds, maps } = {}) {
  
  return nearestLocation
}

function part2({ seeds, maps } = {}) {
  
  return lowestMin
}




export { run }