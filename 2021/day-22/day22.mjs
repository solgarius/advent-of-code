import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  let commands = await getData(testMode)
  // console.log(commands)
  const USE_NAIVE = false
  let onNodes = {}
  let onCubes = []
  _.each(commands, command => {
    if (USE_NAIVE) {
      execCommandNaive(command, onNodes)
    }
    onCubes = execCommand(command, onCubes)
    // console.log('num cubes', onCubes.length)
  })
  // console.log(_.keys(onNodes).length)
  // console.log(onCubes, onCubes.length)
  let totalSize = 0
  _.each(onCubes, cube => {
    totalSize += cube.size()
  })
  console.log('Num On Nodes', totalSize)
}

function execCommandNaive(command, onNodes) {
  let {action, cube} = command
  let xL = cube.x.l
  let xH = cube.x.h
  let yL = cube.y.l
  let yH = cube.y.h
  let zL = cube.z.l
  let zH = cube.z.h
  let min = -50
  let max = 50
  if (xH < min || xL > max || yH < min || yL > max || zH < min || zL > max) {
    // outside the range.
    return
  }
  xL = Math.max(xL, min)
  yL = Math.max(yL, min)
  zL = Math.max(zL, min)
  xH = Math.min(xH, max)
  yH = Math.min(yH, max)
  zH = Math.min(zH, max)
  for (let x = xL; x <= xH; x++) {
    for (let y = yL; y <= yH; y++) {
      for (let z = zL; z <= zH; z++) {
        let str = `${x}_${y}_${z}`
        if (action === 'on') {
          onNodes[str] = true
        } else {
          delete onNodes[str]
        }
      }
    }
  }
}

function execCommand(command, onCubes) {
  const {action, cube: commandCube} = command
  let newCubes = []
  // first update all existing cubes.
  _.each(onCubes, cube => {
    let intersectCube = cube.intersection(commandCube)
    if (intersectCube) {
      let withoutCubes = cube.withoutCube(intersectCube)
      newCubes = newCubes.concat(withoutCubes)
    } else {
      newCubes.push(cube)
    }
  })
  if (action === 'on') {
    // now need to remove all the other cubes from this command cube.
    newCubes.push(commandCube)
  }
  return newCubes
}

class Cube {
  constructor(xL, xH, yL, yH, zL, zH) {
    this.x = xL < xH ? {l: xL, h: xH} : {l: xH, h: xL}
    this.y = yL < yH ? {l: yL, h: yH} : {l: yH, h: yL}
    this.z = zL < zH ? {l: zL, h: zH} : {l: zH, h: zL}
  }

  size() {
    let x = this.x.h - this.x.l + 1
    let y = this.y.h - this.y.l + 1
    let z = this.z.h - this.z.l + 1
    return x * y * z
  }

  /**
   * Finds the region that overlaps with the other cube.
   * @param other
   */
  intersection(other) {
    let intersectX = null
    let intersectY = null
    let intersectZ = null
    if (this.x.l <= other.x.h && other.x.l <= this.x.h) {
      intersectX = {l: Math.max(this.x.l, other.x.l), h: Math.min(this.x.h, other.x.h)}
    }
    if (this.y.l <= other.y.h && other.y.l <= this.y.h) {
      intersectY = {l: Math.max(this.y.l, other.y.l), h: Math.min(this.y.h, other.y.h)}
    }
    if (this.z.l <= other.z.h && other.z.l <= this.z.h) {
      intersectZ = {l: Math.max(this.z.l, other.z.l), h: Math.min(this.z.h, other.z.h)}
    }
    if (intersectX && intersectY && intersectZ) {
      return new Cube(intersectX.l, intersectX.h, intersectY.l, intersectY.h, intersectZ.l, intersectZ.h,)
    }
    return null
  }

  /**
   * Splits this cube by removing the intersecting cube
   * @param intersectCube
   */
  withoutCube(intersectCube) {
    let cubes = []
    // will split into at most 6 cubes. left & right of intersection, above, below, in front and behind intersection
    // left cube (assume x pos is right)
    if (this.x.l < intersectCube.x.l) {
      cubes.push(new Cube(
        this.x.l, intersectCube.x.l - 1,
        this.y.l, this.y.h,
        this.z.l, this.z.h
      ))
    }
    // right cube
    if (this.x.h > intersectCube.x.h) {
      cubes.push(new Cube(
        intersectCube.x.h + 1, this.x.h,
        this.y.l, this.y.h,
        this.z.l, this.z.h
      ))
    }
    // below cube (assume y pos is up)
    if (this.y.l < intersectCube.y.l) {
      cubes.push(new Cube(
        intersectCube.x.l, intersectCube.x.h,
        this.y.l, intersectCube.y.l - 1,
        this.z.l, this.z.h
      ))
    }
    // above cube
    if (this.y.h > intersectCube.y.h) {
      cubes.push(new Cube(
        intersectCube.x.l, intersectCube.x.h,
        intersectCube.y.h + 1, this.y.h,
        this.z.l, this.z.h
      ))
    }
    // in front cube (assume z pos is away from viewer)
    if (this.z.l < intersectCube.z.l) {
      cubes.push(new Cube(
        intersectCube.x.l, intersectCube.x.h,
        intersectCube.y.l, intersectCube.y.h,
        this.z.l, intersectCube.z.l - 1
      ))
    }
    // behind cube
    if (this.z.h > intersectCube.z.h) {
      cubes.push(new Cube(
        intersectCube.x.l, intersectCube.x.h,
        intersectCube.y.l, intersectCube.y.h,
        intersectCube.z.h + 1, this.z.h
      ))
    }
    return cubes
  }
}


async function getData(isTest) {
  let filename = `./day-22/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  return _.map(lines, line => {
    let reg = /(on|off) x=([-0-9]+)\.\.([-0-9]+),y=([-0-9]+)\.\.([-0-9]+),z=([-0-9]+)\.\.([-0-9]+)/g
    let m = reg.exec(line)
    return {
      action: m[1],
      cube: new Cube(
        Number(m[2]), Number(m[3]),
        Number(m[4]), Number(m[5]),
        Number(m[6]), Number(m[7])
      )
    }
  })
}

export {run}