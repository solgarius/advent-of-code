async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

function part1(cards) {
  let sum = 0;
  for (const card of cards) {
    const winCount = getNumWinners(card)
    if (winCount > 0) {
      sum += Math.pow(2, winCount - 1);
    }
  }
  return sum;
}

function part2(cards) {
  let totalCards = 0
  for (const card of cards) {
    card.count = 1
  }
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    totalCards += card.count
    const winCount = getNumWinners(card)
    for(let j = 0; j < winCount; j++){
      cards[i+j + 1].count += card.count
    }
  }
  return totalCards
}

function getNumWinners(card) {
  const { winning, entry } = card;
  const intersection = winning.filter(num => entry.includes(num));
  return intersection.length
}

async function parseLines(lines) {
  let cards = []
  for (const line of lines) {
    const [idStr = '', numStr = ''] = line.split(':')
    const id = idStr.match(/\d+/g)[0]
    const [set1Str, set2Str] = numStr.split('|')
    cards.push({ id, winning: getNums(set1Str), entry: getNums(set2Str) })
  }
  return cards
}

/**
 * Splits the str by space and then for each entry that is a number adds it to an array then sorts the array ascending
 * @param {*} str 
 */
function getNums(str) {
  return str.split(' ')
    .filter(num => num != '')
    .map(Number)
    .sort((a, b) => a - b);
}

export { run }