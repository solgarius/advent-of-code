import {getLines} from '../util/utility.mjs'

async function run(testMode) {
  const testDepths = [199, 200, 208, 210, 200, 207, 240, 269, 260, 263]
  const depths = testMode ? testDepths : await getDepths()
  const singleIncreaseCount = await runSingle(depths)
  const slidingIncreaseCount = await runSliding(depths)

  console.log(`single increases ${singleIncreaseCount}`)
  console.log(`sliding increases ${slidingIncreaseCount}`)
}

async function runSingle(depths = [0]) {
  let prevDepth = null
  let increaseCount = 0
  for (const depth of depths) {
    if (Number.isInteger(prevDepth) && Number.isInteger(depth) && depth > prevDepth) {
      increaseCount++
    }
    prevDepth = depth
  }
  return increaseCount
}

async function runSliding(depths = [0]) {
  let window = [0, 0, 0, 0]
  let increaseCount = 0
  for (const depth of depths) {
    if (Number.isInteger(depth)) {
      window.shift()
      window.push(depth)
      if (window[0] && window[1] && window[2] && window[3]) {
        const prev = window[0] + window[1] + window[2]
        const cur = window[1] + window[2] + window[3]
        if (prev < cur) {
          increaseCount++
        }
      }
    }
  }
  return increaseCount
}

async function getDepths() {
  const lines = await getLines('./day-1/depths.csv')
  let depths = []
  for (const line of lines) {
    try {
      const depth = Number(line)
      if (depth != null) {
        depths.push(depth)
      }
    } catch (e) {
    }
  }
  return depths
}

export {run}