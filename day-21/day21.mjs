async function run(testMode) {
  let {p1, p2} = await getData(testMode)
  doPart1(p1, p2)
  let [p1Wins, p2Wins] = getNumWins([p1 - 1, p2 - 1], [0, 0])
  console.log(p1Wins, p2Wins)
  console.log(p1Wins > p2Wins ? p1Wins : p2Wins)
}


function doPart1(pos1, pos2) {
  let diceVal = 0
  let scores = {p1: 0, p2: 0}
  let positions = {p1: pos1 - 1, p2: pos2 - 1}
  let numDiceRoles = 0
  let isP1Turn = true
  while (scores.p1 < 1000 && scores.p2 < 1000) {
    let player = isP1Turn ? 'p1' : 'p2'
    let roll = (diceVal % 100) + 1 + ((diceVal + 1) % 100) + 1 + ((diceVal + 2) % 100) + 1
    diceVal += 3
    numDiceRoles += 3
    positions[player] = (positions[player] + roll) % 10
    scores[player] += positions[player] + 1
    isP1Turn = !isP1Turn
  }
  console.log(scores, numDiceRoles)
  if (scores.p1 < 1000) {
    console.log(scores.p1 * numDiceRoles)
  } else {
    console.log(scores.p2 * numDiceRoles)

  }
}


function getNumWins(positions, scores, player = 0, maxScore = 21) {
  if (scores[0] >= maxScore) {
    return [1, 0] // player 1 wins
  } else if (scores[1] >= maxScore) {
    return [0, 1] // player 2 wins
  }
  // possible rolls are 3..9 and multipliers are how many combos will result in this score.
  let multipliers = [0, 0, 0, 1, 3, 6, 7, 6, 3, 1]
  let totalWins = [0, 0]
  for (let roll = 3; roll < multipliers.length; roll++) {
    let newPosition = (positions[player] + roll) % 10
    // add 1 because 1..10 board but setting positions as 0..9
    let newScore = scores[player] + (newPosition + 1)
    let wins = null
    if (player) {
      wins = getNumWins([positions[0], newPosition], [scores[0], newScore], 0, maxScore)
    } else {
      wins = getNumWins([newPosition, positions[1]], [newScore, scores[1]], 1, maxScore)
    }
    totalWins[0] += multipliers[roll] * wins[0]
    totalWins[1] += multipliers[roll] * wins[1]
  }
  return totalWins
}

async function getData(isTest) {
  if (isTest) {
    return {p1: 4, p2: 8}
  }
  return {p1: 2, p2: 7}
}

export {run}