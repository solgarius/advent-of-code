import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  let {cipher, image} = await getData(testMode)
  console.log(cipher)
  let iterations = 50
  for (let i = 0; i < iterations; i++) {
    image = iterateImage(cipher, image, i)
    // console.log(printImage(image))
    console.log(`----------${i+1}----${numLitPixels(image)}--------------------------`)
  }
}

// function printImage(image) {
//   let str = ''
//   _.each(image, row => {
//     _.each(row, val => {
//       str += val ? '#' : '.'
//     })
//     str += '\n'
//   })
//   return str
// }

function numLitPixels(image) {
  let numLit = 0
  _.each(image, row => {
    _.each(row, val => {
      if (val) {
        numLit++
      }
    })
  })
  return numLit
}

function iterateImage(cipher, image, iterationCount = 0) {
  const addedBorder = 1
  const defaultValue = cipher[0] && iterationCount % 2 === 1 ? 1 : 0
  let newH = image.length + 2 * addedBorder
  let newW = image[0].length + 2 * addedBorder
  let newImage = new Array(newH)
  for (let h = 0; h < newH; h++) {
    newImage[h] = new Array(newW)
    for (let w = 0; w < newW; w++) {
      let oldH = h - addedBorder
      let oldW = w - addedBorder
      let str = ''
      str += _.defaultTo(image?.[oldH - 1]?.[oldW - 1], defaultValue)
      str += _.defaultTo(image?.[oldH - 1]?.[oldW], defaultValue)
      str += _.defaultTo(image?.[oldH - 1]?.[oldW + 1], defaultValue)
      str += _.defaultTo(image?.[oldH]?.[oldW - 1], defaultValue)
      str += _.defaultTo(image?.[oldH]?.[oldW], defaultValue)
      str += _.defaultTo(image?.[oldH]?.[oldW + 1], defaultValue)
      str += _.defaultTo(image?.[oldH + 1]?.[oldW - 1], defaultValue)
      str += _.defaultTo(image?.[oldH + 1]?.[oldW], defaultValue)
      str += _.defaultTo(image?.[oldH + 1]?.[oldW + 1], defaultValue)
      let cipherIndex = parseInt(str, 2)
      newImage[h][w] = cipher[cipherIndex]
    }
  }
  return newImage
}

async function getData(isTest) {
  let filename = `./day-20/data${isTest ? 'Test' : ''}.csv`
  const lines = await getLines(filename)
  let cipher = lines.shift().split('').map(c => c === '#' ? 1 : 0)
  lines.shift()
  let image = []
  _.each(lines, line => {
    image.push(line.split('').map(c => c === '#' ? 1 : 0))
  })
  return {cipher, image}
}

export {run}