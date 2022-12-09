import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const trees = await getData(testMode)
  const {visibleCount, maxScore} = getVisibleCount(trees)
  console.log(`Visible Count ${visibleCount} Max Score ${maxScore}`)
}

function getVisibleCount(trees){
  let visibleCount = 0
  let maxScore = 0
  console.log(trees)
  for(let i =0; i < trees.length; i++){
    let row = trees[i]
    for(let j =0; j < row.length;j++){
      let {blocked, score} = getBlockedAndScore(i,j, trees)
      if((i === 1 && j === 2) || (i === 3 && j === 2)){
      console.log(i,j, trees[i][j], blocked, score)
      }
      if(!blocked){
        visibleCount++
      }
      if(score > maxScore){ maxScore = score }
    }
  }
  return {visibleCount, maxScore}
}

function getBlockedAndScore(row, col, trees){
  const height = trees[row][col]
  let blocked = 0
  let scores = []
  let blockedInLoop = false
    // check up
    for(let i = row-1; i >= 0; i--){
      if(trees[i][col] >= height){
        blocked++
        scores.push(row-i)
        blockedInLoop = true
        break; // blocked
      }
    }
    if(!blockedInLoop) scores.push(row)
    blockedInLoop = false
  // check left
  for(let i = col-1; i >= 0; i--){
    if(trees[row][i] >= height){
      blocked++
      scores.push(col-i)
      blockedInLoop = true
      break; // blocked
    }
  }
  if(!blockedInLoop) scores.push(col)
  blockedInLoop = false
  // check right
  for(let i = col+1; i < trees[row].length; i++){
    if(trees[row][i] >= height){
      blocked++
      if(row === 1 && col === 2){
        console.log(i)
      }
      scores.push(i - col)
      blockedInLoop = true
      break; // blocked
    }
  }
  if(!blockedInLoop) scores.push(trees[row].length-col-1)
  blockedInLoop = false

  // check down
  for(let i = row+1; i < trees.length; i++){
    if(trees[i][col] >= height){
      blocked++
      scores.push(i-row)
      blockedInLoop = true
      break // blocked
    }
  }
  if(!blockedInLoop) scores.push(trees.length-row-1)
  blockedInLoop = false
  if((row === 1 && col === 2) || (row === 3 && col === 2)){
  console.log(row, col, scores)
  }
  return {blocked: blocked === 4, score:scores[0]*scores[1]*scores[2]*scores[3]}
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 8, isTest)
  let trees = []
  for(let line of lines){
    trees.push(line.split('').map(n=>Number(n)))
  }
  return trees
 }

export {run}