import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  let snailfishNumbers = await getSnailfishNumbers(testMode)
  snailfishNumbers = _.map(snailfishNumbers, reduceNumber)
  let part2SnailfishNumbers = _.cloneDeep(snailfishNumbers)
  part1(snailfishNumbers)
  part2(part2SnailfishNumbers)
}

function part1(snailfishNumbers) {
  let total = _.cloneDeep(snailfishNumbers.shift())
  total = _.reduce(snailfishNumbers, (curTotal, snailfishNumber) => {
    return addNumbers(curTotal, snailfishNumber)
  }, total)
  console.log('TOTAL', total)
  let tree = asTree(total)
  console.log(getMagnitude(tree))
}

function part2(snailfishNumbers) {
  let largestMagnitude = 0
  for (let i = 0; i < snailfishNumbers.length; i++) {
    for (let j = 0; j < snailfishNumbers.length; j++) {
      if (i === j) {
        continue // don't compare against self
      }
      let n1 = _.cloneDeep(snailfishNumbers[i])
      let n2 = _.cloneDeep(snailfishNumbers[j])
      let sum = addNumbers(n1, n2)
      let mag = getMagnitude(asTree(sum))
      if (mag > largestMagnitude) {
        largestMagnitude = mag
      }
    }
  }
  console.log('Largest Mag', largestMagnitude)
}

function getMagnitude(tree) {
  let magL = 0
  let magR = 0
  if (_.isNumber(tree.l)) {
    magL = 3 * tree.l
  } else if (tree.l != null) {
    magL = 3 * getMagnitude(tree.l)
  }
  if (_.isNumber(tree.r)) {
    magR = 2 * tree.r
  } else if (tree.r != null) {
    magR = 2 * getMagnitude(tree.r)
  }

  return magL + magR
}

function asTree(sn) {
  let root = {l: null, r: null, d: 1}
  _.each(sn, num => {
    addNode(root, num)
  })
  return root
}

function addNode(root, num) {
  let targetDepth = num.d
  let n = getNextEmptyNode(root)
  while (n.d < targetDepth) {
    if (n.l == null) {
      n.l = {l: null, r: null, d: n.d + 1}
      n = n.l
    } else if (n.r == null) {
      n.r = {l: null, r: null, d: n.d + 1}
      n = n.r
    }
  }
  if (n.l == null) {
    n.l = num.n
  } else if (n.r == null) {
    n.r = num.n
  }
}

function getNextEmptyNode(root) {
  if (root.l == null) {
    return root
  }
  let emptyNode = null
  if (!_.isNumber(root.l)) {
    emptyNode = getNextEmptyNode(root.l)
  }
  if (emptyNode == null && root.r == null) {
    return root
  }
  if (emptyNode == null && !_.isNumber(root.r)) {
    emptyNode = getNextEmptyNode(root.r)
  }
  return emptyNode
}

function addNumbers(n1, n2) {
  let left = _.cloneDeep(n1)
  let right = _.cloneDeep(n2)
  // console.log('add', left, right)
  _.each(left, n => {
    n.d++
  })
  _.each(right, n => {
    n.d++
  })
  let rtn = left.concat(right)
  // console.log('added 1', rtn)
  rtn = reduceNumber(rtn)
  return rtn
}

function reduceNumber(sn) {
  while (true) {
    let explodedNumber = tryExplode(sn)
    if (explodedNumber) {
      sn = explodedNumber
      // console.log('exploded', sn)
    } else {
      let splitNumber = trySplit(sn)
      if (splitNumber) {
        sn = splitNumber
        // console.log('split', sn)
      } else {
        break // couldn't explode or split.
      }
    }
  }
  return sn
}

function tryExplode(sn) {
  let exploded = false
  for (let i = 0; i < sn.length; i++) {
    let num = sn[i]
    if (num.d > 4) {
      // explode.
      let left = num
      let right = sn[i + 1]
      if (i > 0) {
        sn[i - 1].n += left.n
      }
      if (i < sn.length - 2) {
        sn[i + 2].n += right.n
      }
      sn.splice(i, 2, {d: num.d - 1, n: 0}) // remove i & i+1 and replace with a 0
      exploded = true
      break
    }
  }
  return exploded ? sn : null
}

function trySplit(sn) {
  let split = false
  for (let i = 0; i < sn.length; i++) {
    if (sn[i].n > 9) {
      let n = sn[i].n
      let leftN = Math.floor(n / 2)
      let rightN = Math.ceil(n / 2)
      let d = sn[i].d + 1
      sn.splice(i, 1, {d, n: leftN}, {d, n: rightN})
      split = true
      break
    }
  }
  return split ? sn : null
}

function getNumberFromString(string) {
  let depth = 0
  let numArray = []
  for (let i = 0; i < string.length; i++) {
    let char = string.charAt(i)
    if (char === '[') {
      depth++
    } else if (char === ']') {
      depth--
    } else if (char !== ',') {
      numArray.push({d: depth, n: Number(char)})
    }
  }
  return numArray
}

async function getSnailfishNumbers(isTest) {
  let filename = `./day-18/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  return _.map(lines, getNumberFromString)
}

export {run}