import {getLines} from '../util/utility.mjs'
import _ from 'lodash'
import {median} from 'simple-statistics'

async function run(testMode) {
  const syntaxLines = await getSyntaxLines(testMode)
  const score = getSyntaxErrorScore(syntaxLines)
  console.log(`Syntax Error Score: ${score}`)
  const missingBracketsScore = getMissingBracketsScore(syntaxLines)
  console.log(`Missing Brackets Score: ${missingBracketsScore}`)

}

const openPairs = {'(': ')', '[': ']', '{': '}', '<': '>'}
const closePairs = {')': '(', ']': '[', '}': '{', '>': '<'}

function getSyntaxErrorScore(syntaxLines) {
  const counts = {')': 0, ']': 0, '}': 0, '>': 0}
  _.each(syntaxLines, syntaxLine => {
    const {invalidBracket} = parseLine(syntaxLine)
    if (invalidBracket) {
      counts[invalidBracket]++
    }
  })
  return 3 * counts[')'] + 57 * counts[']'] + 1197 * counts['}'] + 25137 * counts['>']
}

function getMissingBracketsScore(syntaxLines) {
  const score = {'(': 1, '[': 2, '{': 3, '<': 4}
  const lineScores = []
  _.each(syntaxLines, syntaxLine => {
    const {invalidBracket, openBrackets = []} = parseLine(syntaxLine)
    if (invalidBracket || openBrackets.length === 0) {
      return
    }
    // get the line score
    let lineScore = 0
    for (let i = openBrackets.length - 1; i >= 0; i--) {
      lineScore *= 5
      lineScore += score[openBrackets[i]]
    }
    if (lineScore > 0) {
      lineScores.push(lineScore)
    }
  })
  lineScores.sort((a, b) => a - b)
  return median(lineScores)
}

function parseLine(syntaxLine) {
  let invalidBracket = null
  const openBrackets = []
  _.each(syntaxLine, bracket => {
    if (openPairs[bracket]) {
      // opening bracket
      openBrackets.push(bracket)
    } else if (openBrackets.length > 0 && closePairs[bracket] === _.last(openBrackets)) {
      openBrackets.pop()
    } else if (closePairs[bracket]) {
      invalidBracket = bracket
      return false // break out of each loop.
    }
  })
  return {invalidBracket, openBrackets}
}

async function getSyntaxLines(isTest) {
  let filename = isTest ? './day-10/syntaxTest.csv' : './day-10/syntax.csv'
  const lines = await getLines(filename)
  return _.map(lines, line => {
    return line.split('')
  })
}

export {run}