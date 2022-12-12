import {getLinesForDay} from '../../util/utility.mjs'
import util from 'util'

const PART = 2

async function run(testMode) {
  const monkeys = await getData(testMode)
  let modulus = 1 // create the modulus of all the divisible values to limit the size of the worry.
  for(let monkey of monkeys){
    modulus *= monkey.divisible
  }
  iterateMonkeys(monkeys, (PART === 2) ? 10000 : 20, modulus)
  const monkeyBusiness = getMonkeyBusiness(monkeys)
  console.log(`Monkey Business ${monkeyBusiness}`)
}

function iterateMonkeys(monkeys, iterations, modulus){
  for(let i = 0; i < iterations;i++){
    for(const monkey of monkeys){
      while(monkey.items.length > 0){
        let worry = monkey.items.shift()
        worry = updateWorry(monkey, worry, modulus)
        let newMonkey = getNewMonkey(monkey, worry)
        monkeys[newMonkey].items.push(worry)
        monkey.itemsInspected++
      }
    }
    if(i === 0 || i === 19 || i%1000 === 999){
      console.log(`${i+1} | ${monkeys[0].itemsInspected} ${monkeys[1].itemsInspected} ${monkeys[2].itemsInspected} ${monkeys[3].itemsInspected}`)
      // console.log(monkeys[0].items)
      // console.log(monkeys[1].items)
      // console.log(monkeys[2].items)
      // console.log(monkeys[3].items)
    }
  }
}

function updateWorry(monkey, curWorry, modulus){
  let worry = curWorry
  let opValue = monkey.opValue
  if(opValue === 'old'){
    opValue = worry
  }
  if(monkey.opMod === '*'){
    worry *= opValue
  } else if(monkey.opMod === '+'){
    worry += opValue
  }
  worry = worry % modulus
  if(PART === 1){
    worry = Math.floor(worry/3)
  } 

  return worry
}

function getNewMonkey(monkey, worry){
  // console.log(worry, monkey.divisible, worry.mod(monkey.divisible))
  return (worry % monkey.divisible === 0) ? monkey.ifTrue : monkey.ifFalse
}

function getMonkeyBusiness(monkeys){
  let sortedMonkeys = [...monkeys].sort((a,b)=> b.itemsInspected - a.itemsInspected)
  return sortedMonkeys[0].itemsInspected * sortedMonkeys[1].itemsInspected
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 11, isTest)
  let monkeys = []
  for(let line of lines){
    if(line.startsWith('Monkey')){
      monkeys.push({items:[], opMod:'', opValue:0, divisible: 0, ifTrue:0, ifFalse:0, itemsInspected:0})
    } else if(line.startsWith('  Starting')){
      let splitLine = line.split(':')
      let nums = splitLine[1].split(', ').map(n => Number(n))
      monkeys[monkeys.length-1].items = nums
    } else if(line.startsWith('  Operation')){
      let splitLine = line.split('old ')
      let [opMod, opValue] = splitLine[1].split(' ')
      monkeys[monkeys.length-1].opMod = opMod
      monkeys[monkeys.length-1].opValue = opValue === 'old' ? opValue : Number(opValue)
    } else if(line.startsWith('  Test')){
      let splitLine = line.split(' by ')
      monkeys[monkeys.length-1].divisible = Number(splitLine[1])
    } else if(line.startsWith('    If true')){
      let splitLine = line.split('monkey ')
      monkeys[monkeys.length-1].ifTrue = Number(splitLine[1])
    } else if(line.startsWith('    If false')){
      let splitLine = line.split('monkey ')
      monkeys[monkeys.length-1].ifFalse = Number(splitLine[1])
    }
  }
  return monkeys
 }

export {run}

// import {getLinesForDay} from '../../util/utility.mjs'
// import BigNumber from 'bignumber.js'

// const PART = 2

// async function run(testMode) {
//   const monkeys = await getData(testMode)
//   iterateMonkeys(monkeys, (PART === 2) ? 10000 : 20)
//   // console.log(monkeys)
//   const monkeyBusiness = getMonkeyBusiness(monkeys)
//   console.log(`Monkey Business ${monkeyBusiness}`)
// }

// function iterateMonkeys(monkeys, iterations){
//   for(let i = 0; i < iterations;i++){
//     for(const monkey of monkeys){
//       while(monkey.items.length > 0){
//         let worry = monkey.items.shift()
//         worry = updateWorry(monkey, worry)
//         let newMonkey = getNewMonkey(monkey, worry)
//         monkeys[newMonkey].items.push(worry)
//         monkey.itemsInspected++
//       }
//     }
//     if(i === 0 || i === 19 || i%100 === 99){
//       console.log(`${i+1} | ${monkeys[0].itemsInspected} ${monkeys[1].itemsInspected} ${monkeys[2].itemsInspected} ${monkeys[3].itemsInspected}`)
//       console.log(monkeys[0].items)
//       console.log(monkeys[1].items)
//       console.log(monkeys[2].items)
//       console.log(monkeys[3].items)
//     }
//   }
// }

// function updateWorry(monkey, curWorry){
//   let worry = curWorry
//   let opValue = monkey.opValue
//   if(opValue === 'old'){
//     opValue = worry
//   }
//   if(monkey.opMod === '*'){
//     worry = worry.times(opValue)
//   } else if(monkey.opMod === '+'){
//     worry = worry.plus(opValue)
//   }
//   if(PART === 1){
//     worry = worry.div(3).dp(0, BigNumber.ROUND_FLOOR)
//   }
//   // if(worry.mod(monkey.divisible).eq(0)){
//     // worry = worry.div(monkey.divisible)
//   // }
//   return worry
// }

// function getNewMonkey(monkey, worry){
//   // console.log(worry, monkey.divisible, worry.mod(monkey.divisible))
//   return (worry.mod(monkey.divisible).eq(0)) ? monkey.ifTrue : monkey.ifFalse
// }

// function getMonkeyBusiness(monkeys){
//   let sortedMonkeys = [...monkeys].sort((a,b)=> b.itemsInspected - a.itemsInspected)
//   return sortedMonkeys[0].itemsInspected * sortedMonkeys[1].itemsInspected
// }

// async function getData(isTest) {
//   const lines = await getLinesForDay(2022, 11, isTest)
//   let monkeys = []
//   for(let line of lines){
//     if(line.startsWith('Monkey')){
//       monkeys.push({items:[], opMod:'', opValue:0, divisible: 0, ifTrue:0, ifFalse:0, itemsInspected:0})
//     } else if(line.startsWith('  Starting')){
//       let splitLine = line.split(':')
//       let nums = splitLine[1].split(', ').map(n => new BigNumber(Number(n)))
//       monkeys[monkeys.length-1].items = nums
//     } else if(line.startsWith('  Operation')){
//       let splitLine = line.split('old ')
//       let [opMod, opValue] = splitLine[1].split(' ')
//       monkeys[monkeys.length-1].opMod = opMod
//       monkeys[monkeys.length-1].opValue = opValue === 'old' ? opValue : new BigNumber(Number(opValue))
//     } else if(line.startsWith('  Test')){
//       let splitLine = line.split(' by ')
//       monkeys[monkeys.length-1].divisible = new BigNumber(Number(splitLine[1]))
//     } else if(line.startsWith('    If true')){
//       let splitLine = line.split('monkey ')
//       monkeys[monkeys.length-1].ifTrue = Number(splitLine[1])
//     } else if(line.startsWith('    If false')){
//       let splitLine = line.split('monkey ')
//       monkeys[monkeys.length-1].ifFalse = Number(splitLine[1])
//     }
//   }
//   return monkeys
//  }

// export {run}