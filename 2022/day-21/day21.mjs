import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const allMonkeys = await getData(testMode)
  console.log(`Part 1: ${getValue('root', _.cloneDeep(allMonkeys))}`)
  console.log(`Part 2: ${part2(allMonkeys)}`)
}

function part2(allMonkeys){
  allMonkeys.solvedMonkeys.humn = 'return'
  let m1Side = getValue(allMonkeys.unsolvedMonkeys.root.m1, allMonkeys)
  let m2Side = getValue(allMonkeys.unsolvedMonkeys.root.m2, allMonkeys)
  let monkeyToSolveBack = null
  let valueToMatch = 0
  if(!Number.isNaN(m1Side)){
    monkeyToSolveBack = allMonkeys.unsolvedMonkeys.root.m2
    valueToMatch = m1Side
  } else {
    monkeyToSolveBack = allMonkeys.unsolvedMonkeys.root.m1
    valueToMatch = m2Side
  }
  return getValueBackwards(monkeyToSolveBack, valueToMatch, allMonkeys)
}

function getValue(monkey, allMonkeys){
  let value = allMonkeys.solvedMonkeys[monkey]
  if(value != null) return value
  let unsolved = allMonkeys.unsolvedMonkeys[monkey]
  let m1Val = getValue(unsolved.m1, allMonkeys)
  let m2Val = getValue(unsolved.m2, allMonkeys)
  return calcValue(m1Val, m2Val, unsolved ? unsolved.mod : '+', monkey, allMonkeys)
}

function getValueBackwards(monkey, valueToMatch, allMonkeys){
  let value = allMonkeys.solvedMonkeys[monkey]
  if(value != null) return value
  let unsolved = allMonkeys.unsolvedMonkeys[monkey]
  let m1Val = getValue(unsolved.m1, allMonkeys)
  let m2Val = getValue(unsolved.m2, allMonkeys)
  let newValueToMatch = 0
  if(_.isString(m1Val) || Number.isNaN(m1Val)){
    newValueToMatch = calcValue(...getBackwardsMod(valueToMatch, m2Val, unsolved.mod, 'left'), monkey, allMonkeys)
  } else {
    newValueToMatch = calcValue(...getBackwardsMod(valueToMatch, m1Val, unsolved.mod, 'right'), monkey, allMonkeys)
  }
  if(m1Val === 'return' || m2Val === 'return'){
    allMonkeys.solvedMonkeys.humn = newValueToMatch
    return newValueToMatch
  }
  if(Number.isNaN(m1Val)){
    return getValueBackwards(unsolved.m1, newValueToMatch, allMonkeys)
  }
  return getValueBackwards(unsolved.m2, newValueToMatch, allMonkeys)
}

function getBackwardsMod(eqVal, otherVal, mod, side){
  if (side === 'left') {
    if (mod === '+') return [eqVal, otherVal, '-']
    if (mod === '-') return [eqVal, otherVal, '+']
    if (mod === '*') return [eqVal, otherVal, '/']
    if (mod === '/') return [eqVal, otherVal, '*']
    return [eqVal, otherVal, '+']
  }
  if (mod === '+') return [eqVal, otherVal, '-']
  if (mod === '-') return [otherVal, eqVal, '-']
  if (mod === '*') return [eqVal, otherVal, '/']
  if (mod === '/') return [otherVal, eqVal, '/']
  return [eqVal, otherVal, '+']
}

function calcValue(m1Val, m2Val, mod, monkey, allMonkeys){
  let solvedVal = 0
  if(_.isString(m1Val) || _.isString(m2Val)){
    solvedVal = NaN
  } else if(mod === '+'){
    solvedVal = m1Val + m2Val
  } else if(mod === '-'){
    solvedVal = m1Val - m2Val
  } else if(mod === '*'){
    solvedVal = m1Val * m2Val
  } else if(mod === '/'){
    solvedVal = m2Val !== 0 ? m1Val / m2Val : 0
  }
  if(!Number.isNaN(solvedVal)){
    allMonkeys.solvedMonkeys[monkey] = solvedVal
    delete allMonkeys.unsolvedMonkeys[monkey]
  }
  return solvedVal
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 21, isTest)
  let unsolvedMonkeys = {}
  let solvedMonkeys = {}
  for(let line of lines){
    let splitLine = line.split(/[(: )( )]/)
    if(splitLine.length === 3){
      solvedMonkeys[splitLine[0]] = Number(splitLine[2])
    } else {
      unsolvedMonkeys[splitLine[0]] = {m1: splitLine[2], m2: splitLine[4], mod: splitLine[3]}
    }
  }
  return {unsolvedMonkeys, solvedMonkeys}
}

export {run}
