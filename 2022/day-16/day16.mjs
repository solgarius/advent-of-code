import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'
import _ from 'lodash'

let nodeByName = {}

async function run(testMode) {
  const nodes = await getData(testMode)

  nodes.map((n) => nodeByName[n.name] = n)
  console.log(computePaths(30, nodes)[0].releasedPressure) // p1
  part2(nodes)
}

function activeNodes(nodes) {
  return nodes.filter(n => n.rate > 0)
}

function distanceMap(startName, distances = {}){
    if (nodeByName[startName].distanceMap) return nodeByName[startName].distanceMap;
    const spread = (name, steps) => {
        if (distances[name] != undefined && distances[name] <= steps) return;
        distances[name] = steps;
        nodeByName[name].connections.forEach(n => spread(n, steps+1));
    }
    spread(startName, 0);
    nodeByName[startName].distanceMap = distances;
    return distances;
}

function computePaths(timeLeft, nodes) {
    console.log('compute paths for time', timeLeft)
    let paths = [{curr: 'AA', active: activeNodes(nodes).map(n => n.name), timeLeft: timeLeft, finished: false, steps: [], releasedPressure: 0}]

    let max = 0;

    for (let n = 0; n < paths.length; n++) {
        let path = paths[n];
        if (path.timeLeft <= 0) path.finished = true;
        if (path.finished) continue;

        let distances = distanceMap(path.curr), moved = false;
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
                releasedPressure: path.releasedPressure + (path.timeLeft-distances[act]-1)*nodeByName[act].rate
            })
        })
        if (!moved) path.finished = true;
        if (path.finished && path.releasedPressure > max) max = path.releasedPressure;
    }

    return paths.filter(p => p.finished).sort((a, b) => b.releasedPressure-a.releasedPressure);
}

function part2(nodes) {
  let paths = computePaths(26, nodes), max = 0

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

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 16, isTest)
  const nodes = []
  for(let line of lines){
    let tmp = line.split(' ');
    nodes.push({
        name: tmp[1],
        rate: Number(tmp[4].match(/\d+/g)[0]),
        connections: tmp.slice(tmp.indexOf('to')+2).map(v => v.substr(0, 2))
    })
  }
  return nodes
 }

export {run}
