import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'


async function run(testMode) {
  const valves = await getData(testMode)
  let rates = {}
  let byName = {}
  for(let valve of valves){
    byName[valve.name] = valve
    rates[valve.name] = valve.rate
  }
  const distances = getDistances(byName) 
  part1(activeValves(valves), rates, distances)
  part2(activeValves(valves), rates, distances)
}

function part1(valves, rates, distances){
  console.log(computePaths(30, valves, rates, distances)[0].releasedPressure)
}

function part2(valves, rates, distances) {
  let paths = computePaths(26, valves, rates, distances), max = 0

  // this needs some memoization / speed-up / rethinking. Runs approx for 2 minutes ;/
  for (let i = 0; i < paths.length; i++){
    if(i%1000 === 0) console.log(`${i} of ${paths.length}`)
    for (let j = i+1; j < paths.length; j++){
      if (paths[i].steps.every(s => !paths[j].steps.includes(s))){
        if (paths[i].releasedPressure+paths[j].releasedPressure > max) {
            console.log('we have a new p2 max', paths[i].releasedPressure+paths[j].releasedPressure )
            max = paths[i].releasedPressure+paths[j].releasedPressure
        }
      }
    }
  }
}

function activeValves(valves) {
  return valves.filter(n => n.rate > 0).map(n => n.name)
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

function getDistances(valves){
  let distances = {}
  for(let v1 of Object.keys(valves)){
    for(let v2 of valves[v1].connections)
    // weight of the connection to this valve
    setValveDistance(distances, v1, v2, 1)
  }
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
  return distances
}

function computePaths(timeLeft, active, rates, allDistances) {
    console.log('compute paths for time', timeLeft)
    let paths = [{curr: 'AA', active, timeLeft, finished: false, steps: [], releasedPressure: 0}]

    let max = 0;

    for (let n = 0; n < paths.length; n++) {
        let path = paths[n];
        if (path.timeLeft <= 0) path.finished = true;
        if (path.finished) continue;

        let distances = allDistances[path.curr], moved = false;
        path.active.forEach(act => {
            if (act == path.curr) return true;
            if (path.timeLeft-distances[act] <= 1) return true;
            moved = true;
            paths.push({
                curr: act,
                active: path.active.filter(v => v != act),
                timeLeft: path.timeLeft-distances[act]-1,
                finished: false,
                steps: [...path.steps, act],
                releasedPressure: path.releasedPressure + (path.timeLeft-distances[act]-1)*rates[act]
            })
        })
        if (!moved) path.finished = true;
        if (path.finished && path.releasedPressure > max) max = path.releasedPressure;
    }

    return paths.filter(p => p.finished).sort((a, b) => b.releasedPressure-a.releasedPressure);
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 16, isTest)
  const valves = []
  for(let line of lines){
    let tmp = line.split(' ');
    valves.push({
        name: tmp[1],
        rate: Number(tmp[4].match(/\d+/g)[0]),
        connections: tmp.slice(tmp.indexOf('to')+2).map(v => v.substring(0, 2))
    })
  }
  return valves
 }

export {run}
