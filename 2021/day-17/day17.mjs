import _ from 'lodash'

async function run(testMode) {
  let targetArea = await getTargetArea(testMode)
  const highest = getHighestTrajectory(targetArea)
  console.log(`Highest Possible: ${highest?.maxHeight?.y}`)
}

function getHighestTrajectory(targetArea) {
  const trajectories = getPossibleTrajectories(targetArea)
  const maxTrajectory = _.maxBy(trajectories, t => t.maxHeight.y) || {}
  // console.log('MAX', maxTrajectory)
  console.log('Num Trajectories', trajectories.length)
  return maxTrajectory
}

function getPossibleTrajectories(targetArea) {
  const startPos = {x: 0, y: 0}
  const trajectories = []
  for (let x = 0; x < 1000; x++) {
    let curTLen = trajectories.length
    for (let y = -500; y < 1000; y++) {
      const t = getTrajectory({x, y}, startPos, targetArea)
      if (t) {
        const maxHeight = _.maxBy(t, pos => pos.y)
        trajectories.push({maxHeight, t, startVel: {x, y}})
      } else {
        // break
      }
    }
    if (curTLen === trajectories.length && curTLen > 0) {
      // beyond the Xs
      // break
    }
  }
  return trajectories
}

function getTrajectory(startVelocity, startPos, targetArea, dimension = '') {
  let trajectory = []
  const curPos = _.clone(startPos)
  const curVel = _.clone(startVelocity)
  while (!isMissed(curVel, curPos, targetArea, dimension)) {
    trajectory.push(_.clone(curPos))
    if (isHit(curPos, targetArea, dimension)) {
      return trajectory
    }
    step(curVel, curPos)
  }
  return null
}

function step(curVel, curPos) {
  curPos.x += curVel.x
  if (curVel.x > 0) {
    curVel.x--
  } else if (curVel.x < 0) {
    curVel.x++
  }
  curPos.y += curVel.y
  curVel.y--
}

function isMissed(curVel, curPos, targetArea, dimension = '') {
  let xMiss = false
  let yMiss = false
  let absX = Math.abs(curPos.x)
  let xMin = Math.abs(targetArea.xMin)
  let xMax = Math.abs(targetArea.xMax)
  if (absX > xMax) {
    // overshot the max x value and X only slows down never moves backwards.
    xMiss = true
  } else if (absX < xMin && curVel.x === 0) {
    xMiss = true
  }
  if (curPos.y < targetArea.yMin && curVel.y < 0) {
    // dropped too far and continuing to move downwards.
    yMiss = true
  }
  if (dimension === 'x') {
    return xMiss
  }
  if (dimension === 'y') {
    return yMiss
  }
  return xMiss || yMiss
}

function isHit(curPos, targetArea, dimension = '') {
  const xHit = targetArea.xMin <= curPos.x && curPos.x <= targetArea.xMax
  const yHit = targetArea.yMin <= curPos.y && curPos.y <= targetArea.yMax
  if (dimension === 'x') {
    return xHit
  } else if (dimension === 'y') {
    return yHit
  }
  return xHit && yHit
}

async function getTargetArea(isTest) {
  if (isTest) {
    return {xMin: 20, xMax: 30, yMin: -10, yMax: -5}
  }
  return {xMin: 155, xMax: 182, yMin: -117, yMax: -67}
}

export {run}