async function run(lines) {
  const parsedData = await parseLines(lines)
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

function part1({ nums } = {}) {
  let engineParts = 0;
  // Iterate through nums and then check symbol map around the x/y of each num
  // to find any character not '.
  for (const i in nums) {
    if (hasAdjacentSymbol(nums[i])) {
      engineParts += nums[i].n
      nums[i].adjacent = true
    } else {
      nums[i].adjacent = false
    }
    // console.log(`${nums[i].nearby.join('')} | ${nums[i].adjacent} | ${nums[i].n}`)
  }
  return engineParts
}

function hasAdjacentSymbol(num) {
  const { nearby } = num
  const str = nearby.join('').replace(/[\d.]/g, '')
  if (str.length > 0) {
    return true
  }
}

function part2({gears} = {}) {
  let total = 0
  for(const gear of gears){
    total += gear.num1.n * gear.num2.n
  }
  return total
}

async function parseLines(lines) {
  let gears = []
  let nums = []
  let maybeGears = []
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y]
    try {
      const lineNums = line.matchAll(/\d+/g)
      let lastIndex = -1
      for (const num of lineNums) {
        const n = Number(num)
        const x = line.indexOf(n, lastIndex)
        const len = (n + '').length
        lastIndex = x + len
        nums.push({ id: `${x}_${y}`, x, y, n, len })
      }
      const splitLine = line.split('')
      for (let x = 0; x < splitLine.length; x++) {
        if (splitLine[x] === '*') {
          maybeGears.push({ x, y })
        }
      }

    } catch (e) {
      console.error(e)
      // Handle error if necessary
    }
  }
  for (const i in nums) {
    const { x, y, len } = nums[i]
    const nearby = []
    const minX = Math.max(0, x - 1)
    const maxX = Math.min(x + len + 1, lines[y].length)
    const minY = Math.max(0, y - 1)
    const maxY = Math.min(y + 1, lines.length - 1)
    for (let j = minY; j <= maxY; j++) {
      nearby.push(lines[j].substring(minX, maxX))
    }
    nums[i].nearby = nearby
  }
  for (const maybeGear of maybeGears) {
    const range = getMinMax(maybeGear.x, maybeGear.y, lines[0].length, lines.length)
    let gearNums = {}
    for (let y = range.y.min; y <= range.y.max; y++) {
      for (let x = range.x.min; x <= range.x.max; x++) {
        const line = lines[y]
        const char = line.charAt(x);
        if (!isNaN(char)) {
          const n = getNumberAt(x, y, nums)
          if (n) {
            gearNums[n.id] = n
          }
        }
      }
    }
    
    // if there are exactly 2 entries in gearNums then 
    // add this maybeGear with the 2 nums to the gears array
    const gearNumsEntries = Object.entries(gearNums)
    if (gearNumsEntries.length === 2) {
      const [num1, num2] = gearNumsEntries.map(([id, num]) => num)
      gears.push({ num1, num2, x: maybeGear.x, y: maybeGear.y })
    }
  }
  return { gears, nums }
}

function getNumberAt(x, y, nums) {
  for (const num of nums) {
    if (num.y === y && num.x <= x && x <= num.x + num.len) {
      return num
    }
  }
  return null
}

function getMinMax(x, y, width, height) {
  return {
    x: { min: Math.max(0, x - 1), max: Math.min(x + 1, width - 1) },
    y: { min: Math.max(0, y - 1), max: Math.min(y + 1, height - 1) }
  }
}

export { run }