import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import ms from 'ms'
import {performance} from 'perf_hooks'


const NUM_DIGITS = 9
const NUM_BACK_DIGITS = 14 - NUM_DIGITS
const SMALLEST = true
const MODE = 'cumulative'

async function run(testMode) {
  let fullProgram = await getData(testMode)
  if (MODE === 'slow') {
    runSlow(fullProgram)
  } else if (MODE === 'cumulative') {
    runCumulative(fullProgram)
  }
}

function runCumulative(fullProgram) {
  const t0 = performance.now()
  const {resultCount} = getResultSetCumulative(t0, fullProgram, NUM_DIGITS, 0, {})
  const t1 = performance.now()
  let slowMap = getList(resultCount)
  // _.each(resultCount, (num, z)=>{
  //   slowMap.push({num, z: Number(z)})
  // })
  runSlowBack(fullProgram, slowMap)
  const t2 = performance.now()
  console.log(`Duration: ${ms(t1-t0)} + ${ms(t2-t1)} = ${ms(t2-t0)}`)
}

function getResultSetCumulative(t0, fullProgram, numDigits, curDigit = 0, prevResultCount = {}) {
  let testNum = getNextNumber(null, 1)
  // do 1 step
  let program = fullProgram.slice(curDigit, curDigit+1)
  let testZs = _.keys(prevResultCount)
  if (testZs.length === 0) {
    testZs = [0]
  }
  let resultCount = {}
  while (testNum) {
    for (let i = 0; i < testZs.length; i++) {
      let startZ = testZs[i]
      let result = execProgram(program, _.clone(testNum), startZ)
      let newNum = [].concat((prevResultCount[startZ] || []), testNum)
      let resultNum = Number(newNum.join(''))
      let existingNum = resultCount[result.z]
      if(existingNum){ existingNum = Number(existingNum.join(''))}
      if(existingNum == null || (SMALLEST && existingNum > resultNum) || (!SMALLEST && existingNum < resultNum)){
        resultCount[result.z] = newNum
      }
    }
    testNum = getNextNumber(testNum, numDigits)
  }
  const t1 = performance.now()
  if (curDigit > 0) {
    console.log(`Completed Digit ${curDigit + 1}, result set size: ${_.keys(resultCount).length}, duration ${ms(t1 - t0)}`)
  }
  if(curDigit < numDigits-1){
    return getResultSetCumulative(t0, fullProgram, numDigits, curDigit+1, resultCount)
  }
  return {resultCount}
}

function runSlow(fullProgram) {
  let t0 = performance.now()
  let {list: frontList} = getResultSet(fullProgram, NUM_DIGITS, true, 0)
  // _.each(list, item => {
  //   console.log(`${item.num} = ${item.z}`)
  // })
  let t1 = performance.now()
  console.log('Front list', frontList.length, 'Elapsed', ms(t1 - t0))
  // let {list: backList} = getResultSet(fullProgram, 5, false, 0)
  // let t2 = performance.now()
  // console.log('Back List', backList.length, 'Elapsed', ms(t2-t0))
  // let backListNums = _.map(backList, i => {
  //   return ('' + i.num).split('').map(n => Number(n))
  // })
  runSlowBack(fullProgram, frontList)
}

function runSlowBack(fullProgram, frontList){
  let t0 = performance.now()
  let lastPrintedProgress = 0
  for (let i = 0; i < frontList.length; i++) {
    let {num, z} = frontList[i]
    let {bestZero} = getResultSet(fullProgram, NUM_BACK_DIGITS, false, z, true)
    let t3 = performance.now()
    // console.log('Elapsed', ms(t3-t0))
    let progress = Math.floor((i + 1) * 100 / frontList.length)
    if (progress !== lastPrintedProgress) {
      console.log(`Completed ${progress}%`, 'Elapsed', ms(t3 - t0))
      lastPrintedProgress = progress
    }
    if (bestZero) {
      if(_.isArray(num)){
        console.log('number', '' + num.join('') + bestZero)
      } else {
        console.log('number', '' + num + bestZero)
      }
      return
    }
  }
}

function getResultSet(fullProgram, numDigits, fromStart = true, startZ = 0, wantZeroes = false, testList = null) {
  let testNum = getNextNumber(null, numDigits, testList)
  let loops = 0
  let program = fromStart ? fullProgram.slice(0, numDigits) : fullProgram.slice(-numDigits)
  let resultCount = {}
  while (testNum) {
    let result = execProgram(program, _.clone(testNum), startZ)
    if (!wantZeroes && resultCount[result.z] == null) {
      resultCount[result.z] = _.clone(testNum)
    }
    if (result.z === 0 && wantZeroes) {
      console.log('GOT MATCH!', testNum.join(''))
      return {bestZero: Number(testNum.join(''))}
    }
    // if (loops % 100000 === 0) {
    //   console.log(`${testNum.join('')} = ${result.z}`)
    // }
    loops++
    testNum = getNextNumber(testNum, numDigits, testList)
  }
  return {list: getList(resultCount)}
}

function getList(resultCount) {
  let list = []
  _.each(resultCount, (num, zVal) => {
    list.push({num: Number(num.join('')), z: Number(zVal)})
  })
  list = _.sortBy(list, item => SMALLEST ? item.num : -item.num)
  return list
}

function getNextNumber(startNumber = null, numDigits = 7, testNumbers = null) {
  if (testNumbers) {
    if (testNumbers.length === 0) {
      return null
    }
    return testNumbers.shift()
  }
  if (!startNumber) {
    return _.fill(new Array(numDigits), SMALLEST ? 1 : 9)
  }
  if (SMALLEST) {
    for (let i = startNumber.length - 1; i >= 0; i--) {
      startNumber[i]++
      if (startNumber[i] < 10) {
        break
      } else if (i === 0) {
        return null
      } else {
        startNumber[i] = 1
      }
    }

  } else {
    for (let i = startNumber.length - 1; i >= 0; i--) {
      startNumber[i]--
      if (startNumber[i] > 0) {
        break
      } else if (i === 0) {
        return null
      } else {
        startNumber[i] = 9
      }
    }
  }
  return startNumber
}

function execProgram(program, inputs, startZ = 0) {
  let state = {
    w: 0, x: 0, y: 0, z: startZ
  }
  _.each(program, command => {
    state = execCommand(command, state, inputs)
  })
  return state
}

function execCommand(command, state, inputs) {
  let arg1 = command[1]
  let val2 = command[2]
  if (val2 != null) {
    val2 = !_.isNumber(val2) ? state[val2] : val2
  }
  switch (command[0]) {
    case 'cust':
      if (inputs.length > 0) {
        state = execCustomCommand(state, inputs.shift(), command[1], command[2], command[3])
        // console.log(state)
      }
      break
    case 'inp':
      state[arg1] = inputs.shift() || 0
      break
    case 'add':
      state[arg1] += val2
      break
    case 'mul':
      state[arg1] *= val2
      break
    case 'div':
      state[arg1] = Math.trunc(state[arg1] / val2)
      break
    case 'mod':
      state[arg1] = state[arg1] % val2
      break
    case 'eql':
      state[arg1] = state[arg1] === val2 ? 1 : 0
      break
  }
  return state
}

function execCustomCommand(state, input, zVal, xVal, yVal) {
  if (!input) {
    return state
  }
  let action = zVal === 1 ? 'push' : 'pop'
  let z = state.z
  let x = ((z % 26) + xVal) === input ? 0 : 1
  if(action === 'pop'){
    z = Math.trunc(z / 26)
  }
  if (x) {
    z = 26 * z + input + yVal
  }
  return {
    w: input,
    x,
    y: x ? (input + yVal) : 0,
    z
  }
}

function parseCommand(line) {
  let splitLine = line.split(' ')
  for (let i = 1; i < splitLine.length; i++) {
    let str = splitLine[i]
    if (str !== 'w' && str !== 'x' && str !== 'y' && str !== 'z') {
      splitLine[i] = Number(str)
    }
  }
  return splitLine
}

async function getData(isTest) {
  let filename = `./day-24/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  return _.map(lines, parseCommand)

}

export {run}