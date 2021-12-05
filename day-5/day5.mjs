import {getLines} from '../util/utility.mjs'
import {EOL} from 'os'
import _ from 'lodash'

async function run(testMode) {
  const lineSegments = await getLineSegments(testMode)
  const numOverlappingPoints = getNumOverlappingPoints(lineSegments)
  console.log(`Num Overlapping ${numOverlappingPoints}`)
  const numOverlappingPointsWithDiagonals = getNumOverlappingPoints(lineSegments, true)
  console.log(`Num Overlapping ${numOverlappingPointsWithDiagonals}`)
}

function getNumOverlappingPoints(lineSegments, includeDiagonals = false) {
  const ventMap = new VentMap(lineSegments)
  ventMap.fillLineSegments(includeDiagonals)
  console.log(ventMap.toString())
  return ventMap.getOverlaps()
}

async function getLineSegments(isTest) {
  let filename = isTest ? './day-5/linesTest.csv' : './day-5/lines.csv'
  const lines = await getLines(filename)
  // get the line segments
  return lines.map(getLineSegment).filter(lineSegment => lineSegment != null)
}

function getPoint(pointStr = '') {
  const point1Arr = pointStr.split(',').map(num => Number(num))
  if (point1Arr.length === 2) {
    return new Point(point1Arr[0], point1Arr[1])
  }
  return null
}

function getLineSegment(line = '') {
  if (line) {
    // e.g. 0,9 -> 5,9
    let points = line.split(' -> ')
    let point1 = null
    let point2 = null
    if (points.length === 2) {
      point1 = getPoint(points[0])
      point2 = getPoint(points[1])
    }
    if (point1 && point2) {
      return new LineSegment(point1, point2)
    }
  }
  return null
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  toString() {
    return `${this.x},${this.y}`
  }
}

class LineSegment {
  constructor(point1, point2) {
    this.point1 = point1
    this.point2 = point2
  }

  toString() {
    return `${this.point1.toString()} -> ${this.point2.toString()}`
  }

  getMinX() {
    return _.min([this.point1.x, this.point2.x])
  }

  getMaxX() {
    return _.max([this.point1.x, this.point2.x])
  }

  getMinY() {
    return _.min([this.point1.y, this.point2.y])
  }

  getMaxY() {
    return _.max([this.point1.y, this.point2.y])
  }

  getPoints(includeDiagonals = false) {
    let points = []
    let xDelta = (this.point2.x - this.point1.x)
    let yDelta = (this.point2.y - this.point1.y)
    let minY = this.getMinY()
    let maxY = this.getMaxY()
    let minX = this.getMinX()
    let maxX = this.getMaxX()
    let is45Degrees = Math.abs(xDelta) === Math.abs(yDelta)
    if (!xDelta || !yDelta || (includeDiagonals && is45Degrees)) {
      let y = this.point1.y
      let x = this.point1.x
      // iterate from point1 to point2 using the delta.
      while (minY <= y && y <= maxY && minX <= x && x <= maxX) {
        points.push(new Point(x, y))
        y += yDelta < 0 ? -1 : Math.min(yDelta, 1)
        x += xDelta < 0 ? -1 : Math.min(xDelta, 1)
      }
    } else if (includeDiagonals) {
      console.log(`Invalid Diagonal ${this.toString()}`)
    }
    return points
  }
}

class VentMap {
  constructor(lineSegments) {
    let maxX = _.maxBy(lineSegments, lineSegment => lineSegment.getMaxX()).getMaxX()
    let maxY = _.maxBy(lineSegments, lineSegment => lineSegment.getMaxY()).getMaxY()
    this.ventMap = new Array(maxY + 1)
    for (let i = 0; i < this.ventMap.length; i++) {
      this.ventMap[i] = _.fill(Array(maxX + 1), 0)
    }
    this.lineSegments = lineSegments
  }

  toString() {
    const lines = []
    _.each(this.ventMap, (ys) => {
      let line = ''
      _.each(ys, (count) => {
        line += count ? `${count}` : '.'
      })
      lines.push(line)
    })
    return lines.join(EOL)
  }

  fillLineSegments(includeDiagonals = false) {
    _.each(this.lineSegments, lineSegment => {
      let allPoints = lineSegment.getPoints(includeDiagonals)
      _.each(allPoints, point => {
        this.ventMap[point.y][point.x]++
      })
    })
  }

  getOverlaps() {
    let numOverlaps = 0
    _.each(this.ventMap, xs => {
      _.each(xs, count => {
        if (count > 1) {
          numOverlaps++
        }
      })
    })
    return numOverlaps
  }
}

export {run}