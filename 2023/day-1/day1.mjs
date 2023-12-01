import { getLinesForDay } from '../../util/utility.mjs'

const wordMap = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9'
};

const letterMap = getLetterMap(wordMap);
const invertedLetterMap = getLetterMap(wordMap, true)

async function run(testMode) {
  const values = await getData(testMode)
  const sumPt1 = await getTotal(values, 'pt1')
  const sumPt2 = await getTotal(values, 'pt2')

  console.log(`Calibration Sum: ${sumPt1}`)
  console.log(`Calibration Sum With Words: ${sumPt2}`)
}

function getFirstAndLastNumbers(inputString) {
  const numbers = (inputString.match(/\d/g) || []).map(Number)
  if(!numbers || numbers.length === 0){ return 0 }
  const firstNumber = parseInt(numbers[0])
  const lastNumber = parseInt(numbers[numbers.length - 1])
  return parseInt(firstNumber + "" + lastNumber)
}

async function getTotal(values, key = 'pt1') {
  let sum = 0;
  for(let i =0; i < values.length; i++){
    const val = values[i][key];
    sum += val
  }
  
  return sum;
}

async function getData(isTest) {
  const lines = await getLinesForDay(2023, 1, isTest)
  let values = []
  for (const line of lines) {
    try {
      const pt1 = getFirstAndLastNumbers(line);
      const numberLine = convertWordsToNumberFirstLast(line);
      const pt2 = getFirstAndLastNumbers(numberLine);
      values.push({ pt1, pt2, line, numberLine })

    } catch (e) {
      // Handle error if necessary
    }
  }
  return values
}

function getLetterMap(wordMap, inverted = false){
  const letterMap = {};

  for (const word in wordMap) {
    let currentNode = letterMap;
    let w = word;
    if(inverted){
      w = w.split('').reverse().join('')
    }
    for (const letter of w) {
      if (!currentNode[letter]) {
        currentNode[letter] = {};
      }
      currentNode = currentNode[letter];
    }
    currentNode.value = wordMap[word];
  }

  return letterMap;
}

function convertWordsToNumberFirstLast(line) {

  const first = findFirstNumber(line, letterMap)
  const last = findFirstNumber(line.split('').reverse().join(''), invertedLetterMap)

  
  if(first && last){
    return '' + first + last
  }
  return '';
}

function findFirstNumber(line, letterMap){
  let prevLetters = ''
  let currentNode = letterMap;
  for(let i = 0; i < line.length; i++){
    const char = line[i];
    if(currentNode != letterMap && !currentNode[char]){
      // need to reset back to top of tree and try there.
      currentNode = letterMap;
      // because i++ adds 1 again so actually end up at 
      // index after last time started this loop checking for a num.
      i-= prevLetters.length; 
      prevLetters = ''
      continue;
    }
    if (currentNode[char]) {
      prevLetters += char
      currentNode = currentNode[char];
      if (currentNode.value) {
        return currentNode.value;
      }
    } else {
      const charNum = Number(char)
      if(Number.isInteger(charNum) && charNum !== 0){
        return charNum;
      }
    }
  }
  return 0;
}

export { run }