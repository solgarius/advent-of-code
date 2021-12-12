import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const cavePaths = await getCavePaths(testMode)
  const numCavePathsPart1 = getAllCavePaths(cavePaths, 1).length
  console.log(`Number of Cave Paths: ${numCavePathsPart1}`)
  const allPathsPart2 = getAllCavePaths(cavePaths, 2)
  // console.log(_.map(allPathsPart2, path => path.toString()).sort().join('\n'))
  console.log(`Number of Cave Paths: ${allPathsPart2.length}`)
}

function getAllCavePaths(cavePaths, maxPassSmallCave = 1) {
  const allNodes = createCaveMap(cavePaths)
  return getAllPathsFromCave(new CavePath(allNodes.start, maxPassSmallCave), allNodes.start)
}

function getAllPathsFromCave(parentPath, startCave) {
  let paths = []
  _.each(startCave.connectedCaves, cave => {
    if (parentPath.canAddCave(cave)) {
      const newPath = _.cloneDeep(parentPath)
      newPath.addCave(cave)
      if (newPath.isComplete()) {
        paths.push(newPath)
      } else {
        paths = paths.concat(getAllPathsFromCave(newPath, cave))
      }
    }
  })
  return paths
}

function createCaveMap(cavePaths) {
  const allNodes = {start: new CaveNode('start')}
  _.each(cavePaths, path => {
    const [name1, name2] = path
    if (!allNodes[name1]) {
      allNodes[name1] = new CaveNode(name1)
    }
    if (!allNodes[name2]) {
      allNodes[name2] = new CaveNode(name2)
    }
    allNodes[name1].connectNode(allNodes[name2])
  })
  return allNodes
}

class CavePath {
  constructor(cave, maxPassSmallCave = 1) {
    this.path = [cave.name]
    this.maxPassSmallCave = maxPassSmallCave
    this.smallBeyond1 = false
    this.passedCaves = {[cave.name]: 1}
  }

  toString() {
    return this.path.join(',')
  }

  canAddCave(cave) {
    const timesPassed = this.passedCaves[cave.name] || 0
    if (cave.isBig || timesPassed === 0) {
      return true
    }
    if (this.smallBeyond1 || cave.name === 'start' || cave.name === 'end') {
      return false
    }
    return timesPassed < this.maxPassSmallCave
  }

  addCave(cave) {
    if (this.canAddCave(cave)) {
      this.path.push(cave.name)
      this.passedCaves[cave.name] = (this.passedCaves[cave.name] || 0) + 1
      if (!cave.isBig && this.passedCaves[cave.name] > 1) {
        this.smallBeyond1 = true
      }
      return cave
    }
    return null
  }

  isComplete() {
    return this.path.length > 1 && this.path[this.path.length - 1] === 'end'
  }
}

class CaveNode {
  constructor(name = '') {
    this.name = name
    this.isBig = name.toUpperCase() === name
    this.connectedCaves = {}
  }

  connectNode(caveNode) {
    if (!this.connectedCaves[caveNode.name]) {
      this.connectedCaves[caveNode.name] = caveNode
      // bi directional connect
      caveNode.connectNode(this)
    }
  }

}

async function getCavePaths(isTest) {
  let filename = isTest ? './day-12/cavePathsTest.csv' : './day-12/cavePaths.csv'
  const lines = await getLines(filename)
  return _.map(lines, line => line.split('-'))
}

export {run}