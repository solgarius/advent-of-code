const TEST = false
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll('\r', '').split('\n');
const {rules, updates} = parseLines(lines);

part1(rules, updates);
part2(rules, updates);

type Rule = { a: number; b: number };

function part1(rules: Rule[], updates: number[][]) {
    const validUpdates = updates.filter(updateIsValid.bind(null, rules));
    const score = validUpdates.reduce((sum, update) => {
        const middleIndex = Math.floor(update.length / 2);
        return sum + update[middleIndex];
    }, 0);
    console.log(`Part 1: ${score}`);
}


function part2(rules: Rule[], updates: number[][]){
    const invalidUpdates = updates.filter(update => !updateIsValid(rules, update));
    const score = invalidUpdates.reduce((sum, update) => {
        reorderUpdate(rules, update);
        const middleIndex = Math.floor(update.length / 2);
        return sum + update[middleIndex];
    }, 0);
    console.log(`Part 2: ${score}`);

}

function reorderUpdate(rules:Rule[], update:number[]){
    update.sort((x, y): number => {
        return getXBeforeY(rules, x, y)
    });
}

function getXBeforeY(rules: Rule[], x: number, y: number): number {
    if(x === y){ return 0; }
    for (const rule of rules) {
        if (rule.a === y && rule.b === x) {
            return 1;
        }
    }
    return -1;
}

function updateIsValid(rules: Rule[], update: number[]){
    for (const rule of rules) {
        const indexA = update.indexOf(rule.a);
        const indexB = update.indexOf(rule.b);
        if (indexA >= 0 && indexB >= 0 && indexA >= indexB) {
            return false;
        }
    }
    return true;
}

function parseLines(lines: string[]) {
    const rules = [];
    const updates = [];

    for (const line of lines) {
        if (line.includes('|')) {
            const [a, b] = line.split('|').map(Number);
            rules.push({ a, b });
        } else if (line.includes(',')) {
            const update = line.split(',').map(Number);
            updates.push(update);
        }
    }

    return { rules, updates };
}