export { };

const TEST = false
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll('\r', '').split('\n');
const data: number[][] = [];

for (let line of lines) {
    data.push(line.split(' ').map(Number));
}
let gaps: number[] = [];
let safeCount = 0;
for (let row of data) {
     gaps = getGaps(row);
    if (row.length > 1 &&isSafe(gaps)) safeCount++;
}
console.log(`part 1: ${safeCount}`);
safeCount = 0;
for (let row of data) {
    gaps = getGaps(row);
    if (row.length > 1 &&isSafe(gaps, true)) {
        if(!isSafe(row, false)){
        console.log(row, 'now safe');
        }
        safeCount++;
    } else {
        // console.log(row, 'unsafe');
    }
}
console.log(`part 2: ${safeCount}`);

function getGaps(row: number[]){
    let gaps: number[] = [];
    for(let i =0; i < row.length-1;i++){
        gaps.push(row[i+1] - row[i]);
    }
    return gaps
}

function isSafe(gaps: number[], canSkipACol: boolean = false) {
    for(let i =0; i < gaps.length; i++){
        if(!isPairSafe(gaps[i],gaps[i-1])){
            if(canSkipACol){
                canSkipACol = false
                if(!isPairSafe(gaps[i]+gaps[i+1], gaps[i-1])){
                    console.log(`CANNOT SKIP ${gaps[i-1]} ${gaps[i]} ${gaps[i+1]}`, gaps)
                    return false
                }
                i++
            } else {
                return false
            }
        }
    }
    return true;
}

function isPairSafe(gap: number, prevGap: number = 0) {
    if(gap === 0 || Math.abs(gap) > 3) { return false; }
    if((gap * prevGap) < 0){ return false; }
    return true;
}
