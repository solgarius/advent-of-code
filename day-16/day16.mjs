import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import {inspect} from 'util'

async function run(testMode) {
  let binStr = await getBinary(testMode)

  let result = getAllMessages(binStr)
  console.log(inspect(result.messages, false, null, true))
  console.log('Sum All Versions: ' + sumAllVersions(result.messages))
  processExpression(result.messages)
}

const LITERAL_VALUE = 4
const SUM = 0
const PRODUCT = 1
const MIN = 2
const MAX = 3
const GT = 5
const LT = 6
const EQ = 7

function processExpression(messages) {
  const simplifiedMessages = _.map(messages, simplifyMessage)
  printSimplifiedMessages(simplifiedMessages)
}

function printSimplifiedMessages(messages) {
  const newObj = getPrintableSimplifiedMessages(messages)
  console.log(inspect(newObj, false, null, true))
}

function getPrintableSimplifiedMessages(messages) {
  const newObj = []
  _.each(messages, message => {
    if(message.type !== LITERAL_VALUE){
      let sub = getPrintableSimplifiedMessages(message.subPackets)
      let pMsg = sub.length > 0 ? {s: message.str, sub } : message.str
      newObj.push(pMsg)
    }
  })
  return newObj
}

function simplifyMessage(message) {
  message.subPackets = _.map(message.subPackets, simplifyMessage)
  if (message.type === SUM) {
    simplifySum(message)
  } else if (message.type === PRODUCT) {
    simplifyProduct(message)
  } else if (message.type === MIN) {
    simplifyMin(message)
  } else if (message.type === MAX) {
    simplifyMax(message)
  } else if (message.type === GT) {
    simplifyGt(message)
  } else if (message.type === LT) {
    simplifyLt(message)
  } else if (message.type === EQ) {
    simplifyEq(message)
  } else if (message.type === LITERAL_VALUE) {
    message.value = parseInt(message.data, 2)
    message.str = '' + message.value
  }

  return message
}

function simplifySum(message) {
  let total = 0
  let str = ''
  _.each(message.subPackets, packet => {
    let val = packet.value || 0
    if (!str) {
      str = '' + val
    } else {
      str += '+' + val
    }
    total += val
  })
  message.value = total
  message.str = `${str} = ${total}`
}

function simplifyProduct(message) {
  let total = 1
  let str = ''
  _.each(message.subPackets, packet => {
    let val = packet.value || 0
    if (!str) {
      str = '' + val
    } else {
      str += '*' + val
    }
    total *= val
  })
  message.value = total
  message.str = `${str} = ${total}`
}

function simplifyMin(message) {
  let min = Number.MAX_SAFE_INTEGER
  let str = 'Min('
  _.each(message.subPackets, (packet, index) => {
    let val = packet.value || 0
    if (!index) {
      str += '' + val
    } else {
      str += ', ' + val
    }
    if (val < min) {
      min = val
    }
  })
  str += ') = ' + min
  message.value = min
  message.str = str
}

function simplifyMax(message) {
  let max = Number.MIN_SAFE_INTEGER
  let str = 'Max('
  _.each(message.subPackets, (packet, index) => {
    let val = packet.value || 0
    if (!index) {
      str += '' + val
    } else {
      str += ', ' + val
    }
    if (val > max) {
      max = val
    }
  })
  str += ') = ' + max
  message.value = max
  message.str = str
}

function simplifyGt(message) {
  if (message.subPackets.length !== 2) {
    message.value = 0
    message.str = 'GT INVALID'
  } else {
    let v1 = message.subPackets[0].value
    let v2 = message.subPackets[1].value
    if (v1 > v2) {
      message.value = 1
    } else {
      message.value = 0
    }
    message.str = `${v1} > ${v2} = ${message.value}`
  }
}

function simplifyLt(message) {
  if (message.subPackets.length !== 2) {
    message.value = 0
    message.str = 'LT INVALID'
  } else {
    let v1 = message.subPackets[0].value
    let v2 = message.subPackets[1].value
    if (v1 < v2) {
      message.value = 1
    } else {
      message.value = 0
    }
    message.str = `${v1} < ${v2} = ${message.value}`
  }
}

function simplifyEq(message) {
  if (message.subPackets.length !== 2) {
    message.value = 0
    message.str = 'EQ INVALID'
  } else {
    let v1 = message.subPackets[0].value
    let v2 = message.subPackets[1].value
    if (v1 === v2) {
      message.value = 1
    } else {
      message.value = 0
    }
    message.str = `${v1} === ${v2} = ${message.value}`
  }
}

function sumAllVersions(messages) {
  let sum = 0
  _.each(messages || [], message => {
    sum += message.version
    if (message.subPackets && message.subPackets.length > 0) {
      sum += sumAllVersions(message.subPackets)
    }
  })
  return sum
}

function getAllMessages(binStr, maxNumMessages = 0, isSubPackets = false) {
  let messages = []
  while (binStr.length > 0) {
    let result = getNextMessage(binStr, isSubPackets)
    binStr = result.binStr
    messages.push(result.message)
    if (maxNumMessages && messages.length >= maxNumMessages) {
      return {messages, binStr}
    }
  }
  return {messages, binStr}
}

function getNextMessage(binStr, isSubPackets) {

  let bitsAtStart = binStr.length
  const version = parseInt(binStr.substring(0, 3), 2)
  binStr = binStr.substring(3)
  const type = parseInt(binStr.substring(0, 3), 2)
  binStr = binStr.substring(3)
  let data = null
  let subPackets = []
  if (type === LITERAL_VALUE) {
    let result = readLiteralValue(binStr)
    binStr = result.binStr
    data = result.literalValue
  } else {
    let result = getLength(binStr)
    binStr = result.binStr
    let length = result.length
    let numSubPackets = result.numSubPackets
    let subPacketsResult = numSubPackets ?
      getAllMessages(binStr, numSubPackets, true) :
      getAllMessages(binStr.substring(0, length), 0, true)
    subPackets = subPacketsResult.messages
    binStr = numSubPackets ? subPacketsResult.binStr : binStr.substring(length)
  }

  if (!isSubPackets) {
    const bitsUsed = bitsAtStart - binStr.length
    let numBitsToRemove = (4 - (bitsUsed % 4))
    if (numBitsToRemove > 0) {
      binStr = binStr.substring(numBitsToRemove)
    }
    // let clearZeroes = true
    // while (clearZeroes) {
    //   let next4Bits = binStr.substring(0, 4)
    //   if (next4Bits === '0000') {
    //     binStr = binStr.substring(4)
    //   } else {
    //     clearZeroes = false
    //   }
    // }
  }
  return {message: {version, type, data, subPackets}, binStr}
}

function getLength(binStr) {
  let length = 0
  let numSubPackets = 0
  if (binStr.charAt(0) === '0') {
    length = parseInt(binStr.substring(1, 16), 2)
    binStr = binStr.substring(16)
  } else {
    numSubPackets = parseInt(binStr.substring(1, 12), 2)
    binStr = binStr.substring(12)
  }
  return {binStr, length, numSubPackets}
}

function readLiteralValue(binStr) {
  // keep reading 5 bits at a time until leading bit is 0
  let literalValue = ''
  let end = false
  while (!end) {
    let result = getNextLiteralValue(binStr)
    binStr = result.binStr
    end = result.end
    literalValue += result.value
  }
  return {literalValue, binStr}
}

function getNextLiteralValue(binStr) {
  let end = binStr.charAt(0) === '0'
  let value = binStr.substring(1, 5)
  binStr = binStr.substring(5)
  return {value, binStr, end}
}

function hex2bin(hex) {
  return hex.split('').map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join('')
}

async function getBinary(isTest) {
  let filename = `./day-16/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  return hex2bin(lines[0])
}

export {run}