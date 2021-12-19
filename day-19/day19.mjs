import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import {Vector} from 'vanilla-vectors-3d'

async function run(testMode) {
  let scanners = await getScanners(testMode)
  _.each(scanners, scanner => {
    scanner.calculateAllDistances()
  })
  scanners[0].position = new Vector(0, 0, 0)
  let absoluteScanner = scanners.shift()
  let scannersToAdd = _.clone(scanners)
  while (scannersToAdd.length > 0) {
    for (let i = 0; i < scannersToAdd.length; i++) {
      const s2 = scannersToAdd[i]
      let overlap = absoluteScanner.checkOverlap(s2)
      let transformFn = null
      if (overlap) {
        // console.log(i, overlap.pairs.length, inspect(overlap.pairs, false, null, true))
        transformFn = getTransform(overlap.pairs)
        // console.log(transformFn)
      }
      if (transformFn) {
        absoluteScanner.mergeScanner(s2, transformFn)
        s2.position = transformFn(new Vector(0, 0, 0))
        scannersToAdd.splice(i, 1)
      }
    }
  }
  const scannerPositions = [new Vector(0, 0, 0)].concat(scanners.map(s => s.position))
  let maxDistance = 0
  for (let i = 0; i < scannerPositions.length - 1; i++) {
    for (let j = i + 1; j < scannerPositions.length; j++) {
      const p1 = scannerPositions[i]
      const p2 = scannerPositions[j]
      const d = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) + Math.abs(p1.z - p2.z)
      maxDistance = Math.max(d, maxDistance)
    }
  }
  console.log('Done!', absoluteScanner.beacons.length, maxDistance)
}

function getTransform(pairs) {
  let absoluteOffset = null
  let transform = null
  _.each(transformations, transformation => {
    let p0Offset = pairs[0].s1.minus(transformation(pairs[0].s2))
    // every offset Matches
    const isAll = pairs.every(pair => {
      let pairOffset = transformation(pair.s2).plus(p0Offset)
      return pairOffset.isEqualTo(pair.s1)
    })
    if (isAll) {
      transform = transformation
      absoluteOffset = p0Offset
      return false // break out of _.each as found match
    }
  })
  if (transform && absoluteOffset) {
    return (p) => {
      return transform(p).plus(absoluteOffset)
    }
  }
  return null
}

const transformations = [
  p => new Vector(p.x, p.y, p.z),
  p => new Vector(p.x, p.z, p.y),
  p => new Vector(p.y, p.x, p.z),
  p => new Vector(p.y, p.z, p.x),
  p => new Vector(p.z, p.x, p.y),
  p => new Vector(p.z, p.y, p.x),

  p => new Vector(-p.x, p.y, p.z),
  p => new Vector(-p.x, p.z, p.y),
  p => new Vector(-p.y, p.x, p.z),
  p => new Vector(-p.y, p.z, p.x),
  p => new Vector(-p.z, p.x, p.y),
  p => new Vector(-p.z, p.y, p.x),

  p => new Vector(p.x, -p.y, p.z),
  p => new Vector(p.x, -p.z, p.y),
  p => new Vector(p.y, -p.x, p.z),
  p => new Vector(p.y, -p.z, p.x),
  p => new Vector(p.z, -p.x, p.y),
  p => new Vector(p.z, -p.y, p.x),

  p => new Vector(p.x, p.y, -p.z),
  p => new Vector(p.x, p.z, -p.y),
  p => new Vector(p.y, p.x, -p.z),
  p => new Vector(p.y, p.z, -p.x),
  p => new Vector(p.z, p.x, -p.y),
  p => new Vector(p.z, p.y, -p.x),

  p => new Vector(-p.x, -p.y, p.z),
  p => new Vector(-p.x, -p.z, p.y),
  p => new Vector(-p.y, -p.x, p.z),
  p => new Vector(-p.y, -p.z, p.x),
  p => new Vector(-p.z, -p.x, p.y),
  p => new Vector(-p.z, -p.y, p.x),

  p => new Vector(p.x, -p.y, -p.z),
  p => new Vector(p.x, -p.z, -p.y),
  p => new Vector(p.y, -p.x, -p.z),
  p => new Vector(p.y, -p.z, -p.x),
  p => new Vector(p.z, -p.x, -p.y),
  p => new Vector(p.z, -p.y, -p.x),

  p => new Vector(-p.x, p.y, -p.z),
  p => new Vector(-p.x, p.z, -p.y),
  p => new Vector(-p.y, p.x, -p.z),
  p => new Vector(-p.y, p.z, -p.x),
  p => new Vector(-p.z, p.x, -p.y),
  p => new Vector(-p.z, p.y, -p.x),

  p => new Vector(-p.x, -p.y, -p.z),
  p => new Vector(-p.x, -p.z, -p.y),
  p => new Vector(-p.y, -p.x, -p.z),
  p => new Vector(-p.y, -p.z, -p.x),
  p => new Vector(-p.z, -p.x, -p.y),
  p => new Vector(-p.z, -p.y, -p.x)
]

class Scanner {
  constructor() {
    this.beacons = []
    this.distances = {}
    this.position = null
  }

  setPosition(v) {
    this.position = v
  }

  addBeacon(beacon) {
    this.beacons.push(beacon)
    this.beacons = _.uniqBy(this.beacons, getBeaconString)
  }

  mergeScanner(scanner, transform) {
    const self = this
    _.each(scanner.beacons, beacon => {
      self.addBeacon(transform(beacon))
    })
    self.calculateAllDistances()
  }

  calculateAllDistances() {
    for (let i = 0; i < this.beacons.length; i++) {
      let b1 = this.beacons[i]
      let b1Str = getBeaconString(b1)
      this.distances[b1Str] = {b: b1, d: [], b2: [], sub: []}
      for (let j = 0; j < this.beacons.length; j++) {
        let b2 = this.beacons[j]
        if (i === j) {
          continue
        }
        this.distances[b1Str].d.push(calculateDistance(b1, b2))
        this.distances[b1Str].b2.push(b2)
        this.distances[b1Str].sub.push(b1.minus(b2))
      }
    }
  }

  checkOverlap(scanner) {
    let overlap = null
    _.each(this.distances, thisDistObj => {
      _.each(scanner.distances, otherDistObj => {
        // 12 overlapping points therefore 11 overlapping distances.
        let numOverlapping = getNumOverlappingPoints(thisDistObj, otherDistObj)
        if (numOverlapping >= 11 && (!overlap || overlap.over < numOverlapping)) {
          overlap = {over: numOverlapping, s1: thisDistObj, s2: otherDistObj}
          // return false // break out of each loop
        }
      })
      // if (overlap) {
      //   return false // break out of each loop
      // }
    })
    if (overlap) {
      overlap.pairs = getPointPairs(overlap)
    }
    return overlap
  }

}

function getBeaconString(beacon) {
  return `${beacon.x}_${beacon.y}_${beacon.z}`
}

function getPointPairs(overlap) {
  let pairs = [{s1: overlap.s1.b, s2: overlap.s2.b}]
  _.each(overlap.s1.d, (val, i1) => {
      let i2 = overlap.s2.d.indexOf(val)
      if (i2 >= 0) {
        pairs.push({s1: overlap.s1.b2[i1], s2: overlap.s2.b2[i2]})
      }
    }
  )
  return pairs
}

function getNumOverlappingPoints(b1Distances, b2Distances) {
  return _.intersection(b1Distances.d, b2Distances.d).length
}

function calculateDistance(p1, p2) {
  const a = p2.x - p1.x
  const b = p2.y - p1.y
  const c = p2.z - p1.z

  return Math.sqrt(a * a + b * b + c * c)
}

async function getScanners(isTest) {
  let filename = `./day-19/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  let scanners = []
  let curScanner = null
  _.each(lines, line => {
    if (_.startsWith(line, '---')) {
      if (curScanner) {
        scanners.push(curScanner)
      }
      curScanner = new Scanner()
    } else if (line.length > 0) {
      let splitLine = line.split(',').map(n => Number(n))
      curScanner.addBeacon(new Vector(splitLine[0], splitLine[1], splitLine[2]))
    }
  })
  if (curScanner) {
    scanners.push(curScanner)
  }
  return scanners
}

export {run}