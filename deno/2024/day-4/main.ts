const TEST = false
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll('\r', '').split('\n');
const wordSearch = lines.map((line) => line.split(''));

part1(wordSearch);
part2(wordSearch);

function part1(wordSearch){
    let matches = 0;
    for(let row = 0; row < wordSearch.length; row++) {
        for(let col = 0; col < wordSearch[row].length; col++) {
            if(wordSearch[row][col] === 'X'){
                matches += getNumberOfMatches(wordSearch, row, col, 'XMAS');
            }
        }
    }
    console.log(`part 1: ${matches}`)
}


function getNumberOfMatches(wordSearch: string[][], row: number, col: number, word: string): number {
    let matches = 0;
    const directions = [
        { dr: -1, dc: 0 },  // up
        { dr: 1, dc: 0 },   // down
        { dr: 0, dc: -1 },  // left
        { dr: 0, dc: 1 },   // right
        { dr: -1, dc: -1 }, // up-left
        { dr: -1, dc: 1 },  // up-right
        { dr: 1, dc: -1 },  // down-left
        { dr: 1, dc: 1 }    // down-right
    ];

    for (const { dr, dc } of directions) {
        let found = true;
        for (let i = 0; i < word.length; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (
                newRow < 0 || newRow >= wordSearch.length ||
                newCol < 0 || newCol >= wordSearch[row].length ||
                wordSearch[newRow][newCol] !== word[i]
            ) {
                found = false;
                break;
            }
        }
        if (found) matches++;
    }
    return matches;
}

function part2(wordSearch){
    let matches = 0;
    for(let row = 0; row < wordSearch.length-2; row++) {
        for(let col = 0; col < wordSearch[row].length-2; col++) {
            let tl = wordSearch[row][col];
            let tr = wordSearch[row][col+2];
            let bl = wordSearch[row+2][col];
            let br = wordSearch[row+2][col+2];
            let mid = wordSearch[row+1][col+1];
            let Ms = [tl, tr, bl, br].filter((c) => c === 'M').length;
            let Ss = [tl, tr, bl, br].filter((c) => c === 'S').length;
            if(mid === 'A' && Ms === 2 && Ss === 2 && tl !== br){
                matches++;
            }
        }
    }
    console.log(`part 2: ${matches}`)
}