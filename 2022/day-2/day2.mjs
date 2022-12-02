import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const games = await getData(testMode)
  const totalScoreA = games.reduce((totalScore, game)=>{
    return totalScore+game.scoreA
  }, 0)
  const totalScoreB = games.reduce((totalScore, game)=>{
    return totalScore+game.scoreB
  }, 0)

  console.log(`Total Score A ${totalScoreA}`)
  console.log(`Total Score B ${totalScoreB}`)
}

function getScoreA (gameStr) {
  switch(gameStr){
    case 'A X': // rock rock
      return 1 + 3
    case 'A Y': // rock paper
      return 2 + 6
    case 'A Z': // rock scissors
      return 3 + 0
    case 'B X': // paper rock
      return 1 + 0
    case 'B Y': // paper paper
      return 2 + 3
    case 'B Z': // paper scissors
      return 3 + 6
    case 'C X': // scissors rock
      return 1 + 6
    case 'C Y': // scissors paper
      return 2 + 0
    case 'C Z': // scissors scissors
      return 3 + 3
    default:
    return 0;
  }
}

function getScoreB (gameStr) {
  switch(gameStr){
    case 'A X': // rock lose = play scissors
      return 3 + 0
    case 'A Y': // rock draw = play rock
      return 1 + 3
    case 'A Z': // rock win = play paper
      return 2 + 6
    case 'B X': // paper lose = play rock
      return 1 + 0
    case 'B Y': // paper draw = play paper
      return 2 + 3
    case 'B Z': // paper win = play scissors
      return 3 + 6
    case 'C X': // scissors lose = play paper
      return 2 + 0
    case 'C Y': // scissors draw = play scissors
      return 3 + 3
    case 'C Z': // scissors win = play rock
      return 1 + 6
    default:
    return 0;
  }
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 2, isTest)
  let games = []
  for (const line of lines) {
    try {
      games.push({scoreA: getScoreA(line), scoreB: getScoreB(line)})
    } catch (e) {
    }
  }
  return games
}

export {run}