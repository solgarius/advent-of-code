


async function run(lines) {
  const parsedData = await parseLines(lines);
  console.log(`Part 1: ${part1(parsedData)}`);
  console.log(`Part 2: ${part2(parsedData)}`);
}

async function parseLines(lines) {
  const steps = lines[0].toLowerCase().split('')
  let nodes = {}
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i]
    const [from, to] = line.split(' = ')
    let [l,r] = to.split(', ')
    l = l.substring(1)
    r = r.substring(0, r.length - 1)
    nodes[from] = {l,r, name: from}
  }
  return { steps, nodes }
}

function part1({ steps, nodes } = {}) {
  return getStepsForNode('AAA', 'ZZZ', steps, nodes)
}

function part2({ steps, nodes } = {}) {
  let startNodes = Object.values(nodes).filter(n => n.name[2] === 'A')
  let allSteps = startNodes.map(n => getStepsForNode(n.name, 'Z', steps, nodes))
  let foundDivisor = true
  let gcds = []
  while(foundDivisor){
    foundDivisor = false
    let gcd = getGreatestCommonDivisor(allSteps)
    if(gcd > 1){
      gcds.push(gcd)
      allSteps = allSteps.map(s => s / gcd)
      foundDivisor = true
    }
  }
  
  let r = 1
  for(let i = 0 ; i < gcds.length; i++) {
    r *= gcds[i]
  }
  for(let i = 0; i < allSteps.length; i++) {
    r *= allSteps[i]
  }
  return r+''
}

function getGreatestCommonDivisor(nums){
  let gcd = nums[0];
  for (let i = 1; i < nums.length; i++) {
    gcd = getGCD(gcd, nums[i]);
  }
  return gcd;
}

function getGCD(a, b) {
  if (b === 0) {
    return a;
  }
  return getGCD(b, a % b);
}


function getStepsForNode(startNode, endNode, steps, nodes){
  let curNode = nodes[startNode]
  let curStep = 0
  while(curNode && !curNode.name.endsWith(endNode)) {
    const side = steps[curStep % steps.length]
    curNode = nodes[curNode[side]]
    curStep++
  }
  return curStep
}

export { run }