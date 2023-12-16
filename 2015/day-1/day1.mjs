
async function run(lines) {
  const parsedData = await parseData(lines)
  part1(parsedData)
  part2(parsedData)
}

function part1(line) {
  const opens = line.split('').filter(char => char === '(').length;
  const closes = line.split('').filter(char => char === ')').length;
  console.log(`Part 1: ${opens - closes}`);
}

function part2(line) {
  const splitLine = line.split('')
  let floor = 0
  for (let i = 0; i < splitLine.length; i++) {
    if(splitLine[i] === '('){
      floor++
    } else if(splitLine[i] === ')'){
      floor--
    }
    if(floor === -1){
      console.log(`Part 2: ${i+1}`)
      return
    }
  }
}

async function parseData(lines) {
  let values = []
  for (const line of lines) {
    try {


    } catch (e) {
      // Handle error if necessary
    }
  }
  return lines[0]
}

export { run }