async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

function part1({ seeds, maps } = {}) {
  let nearestLocation = Number.MAX_SAFE_INTEGER
  for (const seed of seeds) {
    let curVal = seed
    let curType = 'seed'
    while (curType !== 'location') {
      const map = maps[curType]
      curType = map.to
      curVal = getNewValue(curVal, map.ranges)
    }
    if (nearestLocation > curVal) {
      nearestLocation = curVal
    }
  }
  return nearestLocation
}

function part2({ seeds, maps } = {}) {
  let newRanges = []
  for (let i = 0; i < seeds.length; i += 2) {
    newRanges.push({ min: seeds[i], max: seeds[i] + seeds[i + 1] - 1 })
  }
  // let totalRange = newRanges.reduce((sum, range) => sum + (range.max - range.min) + 1, 0);
  // console.log(totalRange, newRanges.length)

  let curType = 'seed'
  while (curType !== 'location') {
    let tmpRanges = []
    const map = maps[curType]
    curType = map.to
    let orderedBaseRanges = map.ranges.sort((r1, r2) => {
      return r1.src - r2.src
    })
    let allOrderedRanges = []
    for (let i = 0; i < orderedBaseRanges.length; i++) {
      const range = orderedBaseRanges[i]
      allOrderedRanges.push(range)
      const nextRange = orderedBaseRanges[i + 1]
      if (nextRange && range.src + range.range < nextRange.src) {
        allOrderedRanges.push({
          src: range.src + range.range,
          dst: range.src + range.range,
          range: nextRange.src - range.src - range.range
        })
      }
    }
    // convert each new Ranges to the new destination.
    for (const range of newRanges) {
      let ranges = getRanges(range.min, range.max, allOrderedRanges)
      tmpRanges = tmpRanges.concat(ranges)
    }
    // let totalRange = tmpRanges.reduce((sum, range) => sum + (range.max - range.min) + 1, 0);
    // console.log(totalRange, tmpRanges.length)
    newRanges = tmpRanges
  }
  let lowestMin = Number.MAX_SAFE_INTEGER
  for (let range of newRanges) {
    if(range.min < lowestMin){
      lowestMin = range.min
    }
  }
  return lowestMin
}

function getRanges(min, max, orderedRanges) {

  let rtnRanges = []
  let minIndex = getRangeIndex(min, orderedRanges)
  let maxIndex = getRangeIndex(max, orderedRanges)

  if (minIndex === maxIndex) {
    if (minIndex % 2 === 1 || minIndex === -1) {
      // in between ranges so just return full range no transform
      return [{ min, max }]
    } else {
      // within a range so transform
      let r = orderedRanges[minIndex / 2]
      return [{ min: r.dst + (min - r.src), max: r.dst + (max - r.src) }]
    }
  }
  // if here we know that maxIndex > minIndex
  // first add the first range for minIndex

  if (minIndex % 2 === 1) { // in between ranges
    let r = orderedRanges[(minIndex + 1) / 2]
    rtnRanges.push({ min, max: r.src - 1 })
  } else if (minIndex === -1) {
    rtnRanges.push({ min, max: orderedRanges[0].src - 1 })
  } else {
    // if min is in a range then add it to the ranges
    let r = orderedRanges[minIndex / 2]
    rtnRanges.push({ min: r.dst + (min - r.src), max: r.dst + r.range - 1 })
  }
  // if maxIndex more than 1 away from minIndex then add the ranges in between
  // for loop excludes the first minIndex and the last maxIndex
  for (let i = Math.floor((minIndex + 1) / 2) + 1; i < maxIndex / 2; i++) {
    // fill in ranges in between
    let r = orderedRanges[i]
    rtnRanges.push({ min: r.dst, max: r.dst + r.range - 1 })
  }

  // finally get to max Index
  if (maxIndex % 2 === 1) {
    let r = orderedRanges[(maxIndex - 1) / 2]
    rtnRanges.push({ min: r.dst + r.range, max: r.dst + (max - r.src) })
  } else {
    let r = orderedRanges[maxIndex / 2]
    rtnRanges.push({ min: r.dst, max: r.dst + (max - r.src) })
  }
  return rtnRanges
}

function getRangeIndex(value, ranges) {
  let i = 0
  for (i = 0; i < ranges.length; i++) {
    if (value < ranges[i].src) {
      return 2 * i - 1

    } else if (value >= ranges[i].src && value <= ranges[i].src + ranges[i].range) {
      return 2 * i
    }
  }
  return 2 * i - 1
}

function getNewValue(val, ranges) {
  for (const range of ranges) {
    let min = range.src
    let max = range.src + range.range
    if (val >= min && val <= max) {
      return range.dst + (val - min)
    }
  }
  return val
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



export { run }