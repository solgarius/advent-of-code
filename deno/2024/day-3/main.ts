const TEST = false
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll('\r', '').split('\n');

const instructions = lines.join('');

const regex = /mul\(\d+,\d+\)|do\(\)|don't\(\)/g;
const matches = instructions.match(regex);
let sumPart1 = 0;
let sumPart2 = 0;
let matching = true;
for (const match of matches) {
    let val = 0;
    if (match === 'do()') {
        matching = true;
    } else if (match === 'don\'t()') {
        matching = false;
    } else {
        val = getMulValue(match);
    }
    sumPart1 += val;
    if (matching) {
        sumPart2 += val;
    }
}

function getMulValue(match: string): number {
    const [_, num1, num2] = match.match(/mul\((\d+),(\d+)\)/) || [];
    return parseInt(num1) * parseInt(num2);
}
console.log(`part 1: ${sumPart1}`);
console.log(`part 2: ${sumPart2}`);