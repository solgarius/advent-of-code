import {getLinesForDay} from '../../util/utility.mjs'
// import util from 'util'
import _ from 'lodash'

async function run(testMode) {
  const blueprints = await getData(testMode)
  console.log(blueprints)
  console.log(`Part 1: ${part1(blueprints)}`)
  console.log(`Part 2: ${part2(blueprints)}`)

}

function part1(blueprints){
  let totalQuality = 0
  for(let blueprint of blueprints){
    let geodes = getMostGeodes(blueprint, 24)
    // console.log('\n\n\n')
    totalQuality += geodes * blueprint.id
    console.log('GEODES', geodes, blueprint.id, geodes*blueprint.id)
  }
  return totalQuality
}

function part2(blueprints){
  let totalQuality = 1
  for(let i = 0; i < 3; i++){
    let blueprint = blueprints[i]
    let geodes = getMostGeodes(blueprint, 32)
    // console.log('\n\n\n')
    totalQuality *= geodes
    console.log('GEODES', geodes, blueprint.id, geodes*blueprint.id)
  }
  return totalQuality
}

function getMostGeodes(blueprint, allTimeRemaining = 24){
  let maxRobots = {
    ore: Math.max(
        blueprint.ore.ore,
        blueprint.clay.ore,
        blueprint.obsidian.ore,
        blueprint.geode.ore
    ),
    clay: blueprint.obsidian.clay,
  }
  let toCheck = [{timeRemaining: allTimeRemaining, robots: {ore: 1, clay: 0, obsidian: 0, geode: 0}, supply: {ore: 0, clay: 0, obsidian: 0, geode: 0}}]
  let iterations = 0
  let maxGeodes = 0
  while(toCheck.length > 0){
    if(iterations % 1000000 === 0 && iterations > 0){
      console.log(`${toCheck.length} items to check. So far checked ${iterations}`)
    }
    let check = toCheck.shift()
    let builtGeode = false
    // add checks for if intending to build specific robots
    if(check.robots.obsidian > 0){
      // try waiting to build a geode
      let timeToWait = Math.max(
        getTimeToWaitForResource('geode', 'ore', blueprint, check.supply, check.robots),
        getTimeToWaitForResource('geode', 'obsidian', blueprint, check.supply, check.robots)
        )
      if(timeToWait < check.timeRemaining){
        let newRobots = {...check.robots}
        let newSupply = {...check.supply}
        addSupplies(newRobots, newSupply, timeToWait)
        mineBuildAndStore('geode', blueprint, newSupply, newRobots)
        toCheck.unshift({timeRemaining: check.timeRemaining-(timeToWait+1), robots: newRobots, supply: newSupply})
      }     
      if(timeToWait === 0){
        builtGeode = true
      }     
    }
    if(!builtGeode && check.robots.clay > 0){
      // try waiting to build an obsidian
      let timeToWait = Math.max(
        getTimeToWaitForResource('obsidian', 'ore', blueprint, check.supply, check.robots),
        getTimeToWaitForResource('obsidian', 'clay', blueprint, check.supply, check.robots)
        )
      if(timeToWait < check.timeRemaining-2){
        let newRobots = {...check.robots}
        let newSupply = {...check.supply}
        addSupplies(newRobots, newSupply, timeToWait)
        mineBuildAndStore('obsidian', blueprint, newSupply, newRobots)
        toCheck.unshift({timeRemaining: check.timeRemaining-(timeToWait+1), robots: newRobots, supply: newSupply})
      }          
    }
    if(!builtGeode && check.robots.clay < maxRobots.clay){
      // try waiting to build a clay
      let timeToWait = getTimeToWaitForResource('clay', 'ore', blueprint, check.supply, check.robots)
      if(timeToWait < check.timeRemaining-3){ // need at least 3 mins for a clay to be useful
        let newRobots = {...check.robots}
        let newSupply = {...check.supply}
        addSupplies(newRobots, newSupply, timeToWait)
        mineBuildAndStore('clay', blueprint, newSupply, newRobots)
        toCheck.unshift({timeRemaining: check.timeRemaining-(timeToWait+1), robots: newRobots, supply: newSupply})
      }          
    }
    if(!builtGeode && check.robots.ore < maxRobots.ore){
      // try waiting to build an ore
      let timeToWait = getTimeToWaitForResource('ore', 'ore', blueprint, check.supply, check.robots)
      if(timeToWait < check.timeRemaining-4){ // need at least 4 mins for an ore to be useful
        let newRobots = {...check.robots}
        let newSupply = {...check.supply}
        addSupplies(newRobots, newSupply, timeToWait)
        mineBuildAndStore('ore', blueprint, newSupply, newRobots)
        toCheck.unshift({timeRemaining: check.timeRemaining-(timeToWait+1), robots: newRobots, supply: newSupply})
      }          
    }
    
    // wait until 0 with robots that we have and see how many geodes there are.
    let totalGeodes = check.robots.geode * check.timeRemaining + check.supply.geode
    if(totalGeodes > maxGeodes){
      maxGeodes = totalGeodes
      // console.log(`New Max Geodes: ${maxGeodes}`, check)
    }
    iterations++
  }
  return maxGeodes
}

function getTimeToWaitForResource(item, resource, blueprint, supply, robots){
  return Math.ceil(Math.max(0, blueprint[item][resource] - supply[resource]) / robots[resource])
}

function addSupplies(robots, supply, timeSteps = 1){
  for(let resource of Object.keys(robots)){
    supply[resource] += robots[resource] * timeSteps
  }
}

function mineBuildAndStore(item, blueprint, supply, robots){
  let resources = Object.keys(blueprint[item])
  for (let resource of resources){
    supply[resource] -= blueprint[item][resource]
  }
  robots[item]++
  for(let resource of Object.keys(robots)){
    if(item === resource){
      supply[resource] += (robots[resource] - 1)
    } else {
      supply[resource] += robots[resource]
    }
    if(supply[resource] < 0){ 
      console.log('errr???', item, robots, supply)
    }
  }
}

function canIBuild(item, blueprint, supply){
  let resources = Object.keys(blueprint[item])
  for (let resource of resources){
    if(supply[resource] < blueprint[item][resource]){
      return false
    }
  }
  return true
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 19, isTest)
  let blueprints = []
  for(let line of lines){
    if(line.startsWith('//')){
      continue
    }
    let splitLine = line.split(/[(: )( )]/)
    let blueprint = {
      id: Number(splitLine[1]),
      ore: {ore: Number(splitLine[7])},
      clay: {ore: Number(splitLine[13])},
      obsidian: {ore: Number(splitLine[19]), clay: Number(splitLine[22])},
      geode: {ore: Number(splitLine[28]), obsidian: Number(splitLine[31])}
    }
    blueprints.push(blueprint)
  }
  return blueprints
 }

export {run}
