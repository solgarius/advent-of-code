export {};

const TEST = false
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll('\r', '').split('\n');
const left: number[] = [];
const right: number[] = [];

for (const line of lines) {
    if(line.length > 0){
        const [l, r] = line.split('   ');
        left.push(Number(l));
        right.push(Number(r));
    }
}
left.sort();
right.sort();

let score = 0;
for(let i = 0; i < left.length; i++){
    score += Math.abs(left[i] - right[i]);
}

console.log(`part 1: ${score}`);

let rightMode: { [key: number]: number } = {};
for(let r of right){
    rightMode[r] = (rightMode[r] || 0) + 1;
}
let part2Score = 0;
for(let l of left){
    part2Score += (rightMode[l] || 0) * l;
}

console.log(`part 2: ${part2Score}`);
