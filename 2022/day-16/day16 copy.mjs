import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const {rates, distances} = await getData(testMode)
  fillInDistances(distances)

  let closedValves = {}
  for(let valve of Object.keys(rates)){
    if(rates[valve] > 0) closedValves[valve] = true
  }
  logGraph({rates, closedValves})
  const bestPressureRelease = getBestPressureRelease([{valve:'AA', timeRemaining: 0}], 30, rates, distances, closedValves)
  console.log(`Best Pressure Release part 1: ${bestPressureRelease}`)
  // const bestPressureRelease2 = getBestPressureRelease(['AA', 'AA'], 26, rates, distances, closedValves)
  // console.log(`Best Pressure Release part 2: ${bestPressureRelease2}`)
}

function logGraph(valves){
  console.log(util.inspect(valves, false, 4))
}

function permutations(list, maxLength) {
  // Empty list has one permutation
  if (maxLength == 0) return [[]]
  let result = []
  for (let i=0; i<list.length; i++) {
    // Clone list (kind of)
    let copy = Object.create(list)
    // Cut one element from list
    let head = copy.splice(i, 1)
    // Permute rest of list
    let rest = permutations(copy, maxLength-1)
    // Add head to each permutation of rest of list
    for (let j=0; j<rest.length; j++){
      let next = head.concat(rest[j])
      result.push(next)
    }
  }
  return result
}

function mapForValve(curValve, v, rates, distances, timeRemaining){
  let d = getValveDistance(distances, curValve, v)
  let p = (rates[v] * (timeRemaining - d - 1))
  return {v, d, p}
}

function getBestPressureRelease(atValves, timeRemaining, rates, distances, closedValves){
  let newTimeRemaining = timeRemaining
  let pressureAtValve = 0
  let newClosedValves = closedValves
  if(timeRemaining <= 1) return 0
  let openedAnyValves = false
  for(let valveDetails of atValves){
    let valve = valveDetails.valve
    if(valveDetails.timeRemaining === 0 && newClosedValves[valve]){
      pressureAtValve += rates[valve] * (timeRemaining-1)
      delete newClosedValves[valve]
      openedAnyValves = true
    }
  }
  if(openedAnyValves){
    newTimeRemaining--
  }
  
  if(Object.keys(newClosedValves).length > 0){
    let bestSubNodePressure = 0
    let testPermutations = permutations(Object.keys(newClosedValves), atValves.length)
    let curValve = atValves[0].valve
    let closedValvesToTry = testPermutations.map(vs=>{
      let valves = vs.map(v=>mapForValve(curValve, v, rates, distances, newTimeRemaining))
      let p = 0
      for(let valve of valves){
        p+= valve.p
      }
      return {valves, p}
    })
    closedValvesToTry.sort((v1, v2)=>{
      return v2.p - v1.p
    })
    let bestP = closedValvesToTry[0].p
    closedValvesToTry = closedValvesToTry.filter((v=> v.p > 0.5*bestP))
    for(let closedValveToTry of closedValvesToTry){
      let closedValve = closedValveToTry.v
      let childNodeTimeRemaining = newTimeRemaining - closedValveToTry.d
      if(closedValveToTry.p > 0){
        let pressure = getBestPressureRelease([{valve:closedValve, timeRemaining:0}], childNodeTimeRemaining, rates, distances, {...newClosedValves})
        if(pressure > bestSubNodePressure){
          bestSubNodePressure = pressure
        }
      }
    }
    return pressureAtValve + bestSubNodePressure
  }
  return pressureAtValve
}

function setValveDistance(distances, v1, v2, weight){
  distances[v1] = distances[v1] || {}
  distances[v1][v2] = weight
  distances[v2] = distances[v2] || {}
  distances[v2][v1] = weight
}

function getValveDistance(distances, v1, v2){
  if(v1 === v2) return 0
  if(distances[v1] && distances[v1][v2]){
    return distances[v1][v2]
  }
  return Number.MAX_SAFE_INTEGER
}

function allDistancesCalculated(distances){
  let numNodes = Object.keys(distances).length
  for(let valveName of Object.keys(distances)){
    let numKeys =  Object.keys(distances[valveName]).length
    if((numNodes-1) > numKeys){
      return false
    }
  }
  return true
}

function fillInDistances(distances){
  while(!allDistancesCalculated(distances)){
    for(let v1 of Object.keys(distances)){
      for(let v2 of Object.keys(distances[v1])){
        for(let v3 of Object.keys(distances[v2])){
          // fill in the distances between v1 & v3 by skipping v2
          if(v1 !== v3){
            let d1 = getValveDistance(distances, v1, v2)
            let d2 = getValveDistance(distances, v2, v3)
            if(d1 < Number.MAX_SAFE_INTEGER && d2 < Number.MAX_SAFE_INTEGER){
              let newDistance = d1 + d2
              let oldValue = getValveDistance(distances, v1, v3)
              if(oldValue > newDistance){
                setValveDistance(distances, v1, v3, newDistance)
              }
            }
          }
        }
      }
    }
  }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 16, isTest)
  const rates = {}
  const distances = {}
  for(let line of lines){
    let splitLine = line.split('; ')
    let name = splitLine[0].split(' ')[1]
    let rate = Number(splitLine[0].split('=')[1])
    let possibleStartStrs = ['tunnels lead to valves ', 'tunnel leads to valve ']
    for(let startStr of possibleStartStrs){
      if(splitLine[1].startsWith(startStr)){
        let connectedArr = splitLine[1].substring(startStr.length).split(', ')
        for(let v of connectedArr){
          // weight of the connection to this valve
          setValveDistance(distances, name, v, 1)
        }
        break
      }
    }
    rates[name] = rate
  }
  return {rates, distances}
 }

export {run}
