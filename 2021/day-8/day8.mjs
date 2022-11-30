import {getLines} from '../util/utility.mjs'
import _ from 'lodash'

async function run(testMode) {
  const scrambledEntries = await getScrambledEntries(testMode)
  const num1478 = getNumberOf1478(scrambledEntries)
  console.log(`Number of 1, 4, 7 & 8: ${num1478}`)
  const sumDisplayedNumbers = getSumDisplayedNumbers(scrambledEntries)
  console.log(`Sum Displayed Numbers: ${sumDisplayedNumbers}`)

}

function getNumberOf1478(scrambledEntries) {
  let num1478 = 0
  _.each(scrambledEntries, entry => {
    _.each(entry.display, num => {
      // number 1, 7, 4 & 8 respectively
      if (num.length === 2 || num.length === 3 || num.length === 4 || num.length === 7) {
        num1478++
      }
    })
  })
  return num1478
}

function getSumDisplayedNumbers(scrambledEntries) {
  return _.sum(_.map(scrambledEntries, getDisplayedNumber))
}

function getDisplayedNumber(scrambledEntry) {
  const unscrambledNumbers = getUnscrambledNumbers(scrambledEntry.numbers)
  let displayedNumber = _.map(scrambledEntry.display, displayStr => unscrambledNumbers[displayStr])
  displayedNumber = Number(displayedNumber.join(''))
  return displayedNumber
}

/**
 * Number format
 *   0:      1:      2:      3:      4:
 *  aaaa    ....    aaaa    aaaa    ....
 * b    c  .    c  .    c  .    c  b    c
 * b    c  .    c  .    c  .    c  b    c
 *  ....    ....    dddd    dddd    dddd
 * e    f  .    f  e    .  .    f  .    f
 * e    f  .    f  e    .  .    f  .    f
 *  gggg    ....    gggg    gggg    ....
 *
 *   5:      6:      7:      8:      9:
 *  aaaa    aaaa    aaaa    aaaa    aaaa
 * b    .  b    .  .    c  b    c  b    c
 * b    .  b    .  .    c  b    c  b    c
 *  dddd    dddd    ....    dddd    dddd
 * .    f  e    f  .    f  e    f  .    f
 * .    f  e    f  .    f  e    f  .    f
 *  gggg    gggg    ....    gggg    gggg
 * @param scrambledNumbers
 */
function getUnscrambledNumbers(scrambledNumbers) {
  // all possible characters that could align with the 7 segment display
  // example 7 segment display by letter:
  //  dddd
  // e    a
  // e    a
  //  ffff
  // g    b
  // g    b
  //  cccc
  // denote segments by t (top), m (middle), b (bottom),
  // tl (top left), tr (top right), bl (bottom left), br (bottom right)
  const segmentPossibles = {
    t: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    m: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    b: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    tl: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    tr: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    bl: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    br: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  }
  // eliminated out the uniques - 1, 4, 7, 8

  // group by length as need to solve in specific order.
  const groupedNumbers = _.groupBy(scrambledNumbers, number => number.length)
  const unscrambledNumbers = {
    // all unique numbers are unscrambled.
    1: groupedNumbers[2][0],
    4: groupedNumbers[4][0],
    7: groupedNumbers[3][0],
    8: groupedNumbers[7][0]
  }

  // number 1
  segmentPossibles.tr = _.clone(unscrambledNumbers[1])
  segmentPossibles.br = _.clone(unscrambledNumbers[1])
  // eg {
  //   t: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   m: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   b: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   tl: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   tr: [ 'f', 'g' ],
  //   bl: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   br: [ 'f', 'g' ]
  // }
  // console.log(segmentPossibles)
  // number 7 is made of up a top segment + number 1's segments, so top is the unique letter.
  segmentPossibles.t = _.difference(unscrambledNumbers[7], unscrambledNumbers[1])
  // eg
  // {
  //   t: [ 'c' ],
  //   m: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   b: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   tl: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   tr: [ 'f', 'g' ],
  //   bl: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   br: [ 'f', 'g' ]
  // }
  // console.log(segmentPossibles)
  // number 4 is made up of top left & middle segment + number 1's segments.
  segmentPossibles.tl = _.difference(unscrambledNumbers[4], unscrambledNumbers[1])
  segmentPossibles.m = _.difference(unscrambledNumbers[4], unscrambledNumbers[1])
  // eg {
  //   t: [ 'c' ],
  //   m: [ 'a', 'e' ],
  //   b: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   tl: [ 'a', 'e' ],
  //   tr: [ 'f', 'g' ],
  //   bl: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ],
  //   br: [ 'f', 'g' ]
  // }
  // console.log(segmentPossibles)
  // now bottom & bottom left are the remaining unused characters as they aren't in 4 or 7.
  let allUsedChars = {}
  _.each(unscrambledNumbers[4], letter => allUsedChars[letter] = true)
  _.each(unscrambledNumbers[7], letter => allUsedChars[letter] = true)
  segmentPossibles.bl = _.difference(segmentPossibles.bl, _.keys(allUsedChars))
  segmentPossibles.b = _.difference(segmentPossibles.bl, _.keys(allUsedChars))
  // eg {
  //   t: [ 'c' ],
  //   m: [ 'a', 'e' ],
  //   b: [ 'b', 'd' ],
  //   tl: [ 'a', 'e' ],
  //   tr: [ 'f', 'g' ],
  //   bl: [ 'b', 'd' ],
  //   br: [ 'f', 'g' ]
  // }
  // console.log(segmentPossibles)
  // now to figure out 2, 3 & 5 (the 5 letter segments).
  // 2 will contain 1 of the top left / middle remaining letters and 1 of the tr, br (number 1) letters
  _.each(groupedNumbers[5], scrambledNumber => {
    // 3 will contain 1, 2 & 5 will not
    if (_.intersection(unscrambledNumbers[1], scrambledNumber).length === 2) {
      unscrambledNumbers[3] = scrambledNumber
    } else if (_.intersection(segmentPossibles.bl, scrambledNumber).length === 2) {
      // as bottom left and bottom only have 2 left, number 2 will contain both letters possible for bottom left.
      unscrambledNumbers[2] = scrambledNumber
    } else {
      unscrambledNumbers[5] = scrambledNumber
    }
  })
  // now update to each possible segment.
  // bottom is the letter that is in both 5 & remaining segmentPossibles for bottom (as it doesn't have bottom left)
  segmentPossibles.b = _.intersection(segmentPossibles.b, unscrambledNumbers[5])
  // which means bl is the other letter.
  segmentPossibles.bl = _.difference(segmentPossibles.bl, segmentPossibles.b)
  // middle letter is the letter that is in both 2 & remaining segment possibles for 2 (as it doesn't have top left)
  segmentPossibles.m = _.intersection(segmentPossibles.m, unscrambledNumbers[2])
  // which means tl is the other letter
  segmentPossibles.tl = _.difference(segmentPossibles.tl, segmentPossibles.m)
  // similar to above logic top right is in 2 and bottom right is not
  segmentPossibles.tr = _.intersection(segmentPossibles.tr, unscrambledNumbers[2])
  // which means br is the other letter
  segmentPossibles.br = _.difference(segmentPossibles.br, segmentPossibles.tr)
  // eg { t: [ 'c' ], m: [ 'a' ], b: [ 'b' ], tl: [ 'e' ], tr: [ 'f' ], bl: [ 'd' ], br: [ 'g' ] }
  // lastly to unscramble 0, 6 & 9
  const mapped = {}
  _.each(segmentPossibles, (value, key) => {
    mapped[key] = value[0]
  })

  const numberSegments = {
    0: ['t', 'tl', 'tr', 'bl', 'br', 'b'],
    6: ['t', 'tl', 'm', 'bl', 'br', 'b'],
    9: ['t', 'tl', 'tr', 'm', 'br', 'b']
  }
  _.each(numberSegments, (segmentMap, number) => {
    unscrambledNumbers[number] = _.map(segmentMap, key => mapped[key]).sort()
  })
  const unscrambledByString = {}
  _.each(unscrambledNumbers, (strArr, num) => {
    unscrambledByString[strArr.join('')] = Number(num)
  })
  // console.log('FINAL', segmentPossibles, unscrambledByString)
  return unscrambledByString
}


async function getScrambledEntries(isTest) {
  let filename = isTest ? './day-8/7SegDisplayTest.csv' : './day-8/7SegDisplay.csv'
  const lines = await getLines(filename)
  return _.map(lines, getScrambledEntry)
}

function getScrambledEntry(line = '') {
  let splitData = line.split(' | ')
  let numbers = getIndividualScrambledNumbers(splitData[0])
  // keep the display as a string just sort the characters
  let display = _.map(getIndividualScrambledNumbers(splitData[1]), arr => arr.join(''))
  return {numbers, display}
}

function getIndividualScrambledNumbers(numberStr) {
  return _.map(numberStr.split(' '), scrambledNumberStr => scrambledNumberStr.split('').sort())
}

export {run}