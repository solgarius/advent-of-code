import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const sensors = await getData(testMode)
  const numImpossibleLocations = getNumImpossibleLocations(sensors, testMode ? 10 : 2000000)
  console.log(`Num Impossible Locations ${numImpossibleLocations}`)
  let searchArea = {x1: 0, x2: 20, y1: 0, y2: 20}
  if(!testMode){
    searchArea.x2 = 4000000
    searchArea.y2 = 4000000
  }
  const distressBeaconLocation = getDistressBeaconLocation(sensors, searchArea)
  if(distressBeaconLocation){
    const tuningFrequency = 4000000*distressBeaconLocation.x + distressBeaconLocation.y
    console.log(`Tuning Frequency: ${tuningFrequency}`)
  }
}

function getNumImpossibleLocations(sensors, y){
  let numImpossibleLocations = 0
  let ranges = getRangesAtY(sensors, y)
  let lastX = Number.MIN_SAFE_INTEGER
  for(let range of ranges){
    if(range.x2 > lastX){
      numImpossibleLocations += range.x2 - Math.max(lastX, range.x1)
      lastX = range.x2
    }
  }
  return numImpossibleLocations
}

function getRangesAtY(sensors, y, minX = Number.MIN_SAFE_INTEGER, maxX = Number.MAX_SAFE_INTEGER){
  let allRanges = []
  for(let sensor of sensors){
    let distAtY = sensor.distance - Math.abs(sensor.sensorY - y)
    if(distAtY >= 0){
      allRanges.push({x1: sensor.sensorX-distAtY, x2: sensor.sensorX+distAtY})
    }
  }
  allRanges.sort((a,b)=> a.x1-b.x1)
  let lastX = minX
  let ranges = []
  for(let range of allRanges){
    if(lastX >= maxX){ break }
    let x1 = Math.max(range.x1, minX)
    let x2 = Math.min(range.x2, maxX)
    if(x2 > lastX){
      if(x1 > lastX +1){
        ranges.push({x1, x2})
      } else if(ranges.length === 0){
        ranges.push({x1: lastX, x2: x2})
      } else {
        ranges[ranges.length-1].x2 = x2
      }
      lastX = range.x2
    }
  }
  return ranges
}

function getDistressBeaconLocation(sensors, searchArea){
  let x = searchArea.x1
  let y = searchArea.y1
  while(y <= searchArea.y2){
    let ranges = getRangesAtY(sensors, y, searchArea.x1, searchArea.x2)
    if(ranges.length > 1){
      return {x:ranges[0].x2+1, y}
    }
    y++
  }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 15, isTest)
  const sensors = []
  for(let line of lines){
    let splitLine = line.split(/[(=)(, )(: )]/)
    let sensor = {
      sensorX: Number(splitLine[3]), 
      sensorY: Number(splitLine[6]), 
      beaconX: Number(splitLine[13]), 
      beaconY: Number(splitLine[16])
    }
    sensor.distance = Math.abs(sensor.sensorX - sensor.beaconX) + Math.abs(sensor.sensorY - sensor.beaconY)
    sensors.push(sensor)
  }
  return sensors
 }

export {run}
