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
    const hand = {cards: cards.split(''), bid: parseInt(bid)}
    hand.original = [...hand.cards]
    hand.cards = hand.cards.sort((a,b)=> getCardScore(b) - getCardScore(a))
    hand.entries = getHandEntries(getHandMap(hand))
    hand.jokerEntries = getHandEntriesWithJokers(getHandMap(hand))
    hand.type = getHandType(hand.entries)
    hand.jokerType = getHandType(hand.jokerEntries)
    hands.push(hand)
  }
  return { hands }
}

function part1({ hands } = {}) {

  let sortedHands = hands.sort((a,b)=> compareHands(a.original, a.type, b.original, b.type))
  // for(let hand of sortedHands){
    // console.log(hand.cards.join(''), hand.type, hand.bid)
  // }
  let score = 0
  for(let i =0; i < sortedHands.length; i++){
    score += (i+1) * (sortedHands[i].bid)
  }
  return score
}

function part2({ hands } = {}) {
  let sortedHands = hands.sort((a,b)=> 
    compareHands(a.original, a.jokerType, b.original, b.jokerType, true))
  // for(let hand of sortedHands){
  //   console.log(hand.cards.join(''), hand.type, hand.bid)
  // }
  let score = 0
  for(let i =0; i < sortedHands.length; i++){
    score += (i+1) * (sortedHands[i].bid)
  }
  return score
}

function compareHands(aOriginal, aType, bOriginal, bType, jokerScoreMode = false) {
  if(aType !== bType){
    return aType - bType
  }
  for(let i = 0; i < aOriginal.length; i++){
    let cardA = aOriginal[i]
    let cardB = bOriginal[i]
    if(cardA !== cardB){
      if(jokerScoreMode && cardA === 'J'){
        cardA = '1'
      }
      if(jokerScoreMode && cardB === 'J'){
        cardB = '1'
      }
      return getCardScore(cardA) - getCardScore(cardB)
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
  for(let entry of entries){
    entry[0] = parseInt(entry[0])
  }
  return entries.sort((a, b) => {
    let countDiff = b[1] - a[1]
    if(countDiff !== 0){
      return countDiff
    }
    return b[0] - a[0]
  })
}

function getHandEntriesWithJokers(handMap){
  const entries = Object.entries(handMap)
  for(let entry of entries){
    entry[0] = parseInt(entry[0])
  }
  let jokerIndex = entries.findIndex(entry => entry[0] === getCardScore('J'))
  let jokerCount = 0
  if(jokerIndex >= 0){
    jokerCount = entries[jokerIndex][1]
    if(jokerCount < 5){
      entries.splice(jokerIndex, 1)
    }
  }
  let newEntries = entries.sort((a, b) => {
    let countDiff = b[1] - a[1]
    if(countDiff !== 0){
      return countDiff
    }
    return b[0] - a[0]
  })
  if(jokerCount < 5){
    newEntries[0][1] += jokerCount
  }
  return newEntries
}

function getHandType(entries){
  if (isFiveOfAKind(entries)) {
    return FIVE_OF_A_KIND
  }
  if (isFourOfAKind(entries)) {
    return FOUR_OF_A_KIND
  }
  if (isFullHouse(entries)) {
    return FULL_HOUSE
  }
  if (isThreeOfAKind(entries)) {
    return THREE_OF_A_KIND
  }
  if (isTwoPair(entries)) {
    return TWO_PAIR
  }
  if (isOnePair(entries)) {
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