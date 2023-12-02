async function run(lines) {
  const games = await parseLines(lines)
  for(const game of games){
    getGameInfo(game)
  }
  part1(games);
  part2(games);
}

function part1(games){
  let validGamesSum = 0;
  const max = {red: 12, green: 13, blue: 14}
  for(const game of games){
    let excluded = false;
    for(const colour in max){
      if(game.atLeastColours[colour] && max[colour] < game.atLeastColours[colour]){
        excluded = true;
        break;
      }
    }
    if(!excluded){
      validGamesSum += game.id
    }
  }
  console.log(`Part 1: ${validGamesSum}`)
}

function part2(games){
  let totalGamePower = 0;
  for(const game of games){
    let atLeastPow = 1;
    for(const colour in game.atLeastColours){
      atLeastPow *= game.atLeastColours[colour]
    }
    totalGamePower += atLeastPow
  }
  console.log(`Part 2: ${totalGamePower}`)
}

function getGameInfo(game){
  const atLeastColours = {}
  let atLeast = 0
  for(const round of game.rounds){
    for(const colour in round){
      if(!atLeastColours[colour] || atLeastColours[colour] < round[colour]){
        atLeastColours[colour] = round[colour]
      }
    }
  }
  for(const colour in atLeastColours){
    atLeast += atLeastColours[colour]
  }
  game.atLeast = atLeast
  game.atLeastColours = atLeastColours
}

async function parseLines(lines) {
  let games = []
  for (const line of lines) {
    try {
      // split first by : 
      let strs = line.split(':');
      const gameId = Number(strs[0].split(' ')[1])
      const game = {id: gameId, rounds:[]}
      const roundStrs = strs[1].split(';');
      for(const roundStr of roundStrs){
        const round = {}
        const colourStrs = roundStr.split(',');
        for(const colourStr of colourStrs){
          const splitColourStr = colourStr.trim().split(' ')
          const colour = splitColourStr[1]
          const count = Number(splitColourStr[0])
          round[colour] = count;
        }
        game.rounds.push(round)
      }
      games.push(game)
    } catch (e) {
      // Handle error if necessary
    }
  }
  return games
}

export { run }