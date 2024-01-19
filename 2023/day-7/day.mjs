const FIVE_OF_A_KIND = 7;
const FOUR_OF_A_KIND = 6;
const FULL_HOUSE = 5;
const THREE_OF_A_KIND = 4;
const TWO_PAIR = 3;
const ONE_PAIR = 2;
const HIGH_CARD = 1;


async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  const maps = {}
  let hands = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const [cards, bid] = line.split(' ')
    hands.push({cards: cards.split(''), bid: parseInt(bid)})
  }
  return { hands }
}

function part1({ hands } = {}) {
  for(let i = 0; i < hands.length; i++){
    const hand = hands[i]
    hand.cards = hand.cards.sort((a,b)=> getCardScore(b) - getCardScore(a))
    hand.type = getHandType(hand)
  }
  let sortedHands = hands.sort(compareHands)
  console.log(sortedHands)
  let score = 0
  for(let i =0; i < sortedHands.length; i++){
    score += (i+1) * (sortedHands[i].bid)
  }
  return score
}

function part2({ hands } = {}) {
  return 0
}

function compareHands(handA, handB) {
  const entriesA = getHandEntries(getHandMap(handA))
  const entriesB = getHandEntries(getHandMap(handB))
  for(let i = 0; i < entriesA.length; i++){
    const entryA = entriesA[i]
    const entryB = entriesB[i]
    if(entryA[1] !== entryB[1]){
      return entryA[1] - entryB[1]
    } else if(entryA[0] !== entryB[0]){
      return entryA[0] - entryB[0]
    }
  }
  return 0
}

function getCardScore(card){
  if(card === 'A'){
    return 14
  } else if(card === 'K'){  
    return 13
  } else if(card === 'Q'){
    return 12
  } else if(card === 'J'){
    return 11
  } else if(card === 'T'){
    return 10
  }
  return parseInt(card)
}

function getHandMap(hand){
  const handMap = {}
  for(let i = 0; i < hand.cards.length; i++){
    const card = hand.cards[i]
    const score = getCardScore(card)
    if(!handMap[score]){
      handMap[score] = 1
    } else {
      handMap[score]++
    }
  }
  return handMap
}

function getHandEntries(handMap){
  const entries = Object.entries(handMap)
  return entries.sort((a, b) => {
    let countDiff = b[1] - a[1]
    if(countDiff !== 0){
      return countDiff
    }
    return b[0] - a[0]
  })
}

function getHandType(hand){
  const handEntries = getHandEntries(getHandMap(hand))
  if (isFiveOfAKind(handEntries)) {
    return FIVE_OF_A_KIND
  }
  if (isFourOfAKind(handEntries)) {
    return FOUR_OF_A_KIND
  }
  if (isFullHouse(handEntries)) {
    return FULL_HOUSE
  }
  if (isThreeOfAKind(handEntries)) {
    return THREE_OF_A_KIND
  }
  if (isTwoPair(handEntries)) {
    return TWO_PAIR
  }
  if (isOnePair(handEntries)) {
    return ONE_PAIR
  }
  return HIGH_CARD
}

function isFiveOfAKind(handEntries){
  return handEntries.length === 1
}

function isFourOfAKind(handEntries){
  return handEntries.length === 2 && handEntries[0][1] === 4
}

function isFullHouse(handEntries){
  return handEntries.length === 2 && handEntries[0][1] === 3
}

function isThreeOfAKind(handEntries){
  return handEntries.length === 3 && handEntries[0][1] === 3
}

function isTwoPair(handEntries){
  return handEntries.length === 3 && handEntries[0][1] === 2
}

function isOnePair(handEntries){
  return (handEntries.length === 4)
}

export { run }