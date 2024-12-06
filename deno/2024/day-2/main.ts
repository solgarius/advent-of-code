export { };

const TEST = false
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll('\r', '').split('\n');
const data: number[][] = [];

for (let line of lines) {
    data.push(line.split(' ').map(Number));
}
let safeCount = 0;
for (let row of data) {
    if (isSafe(row)) safeCount++;
}
console.log(`part 1: ${safeCount}`);
console.log(`part 2: ${part2(data).length}`);

function part2(rows){
    let safeRows: number[] = [];

	for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
		let safeEnough = false;

		for (let i = 0; i < row.length; i++) {
			const removed = [...row.slice(0, i), ...row.slice(i + 1)];

			if (isSafe(removed)) {
				safeEnough = true;
				break;
			}
		}

		if (safeEnough || isSafe(row)) safeRows.push(rowIndex);
	}
    return safeRows;
}

function isSafe(row: number[]) {
	const differences: number[] = [];

	for (let i = 1; i < row.length; i++) {
		differences.push(row[i] - row[i - 1]);
	}

	const increasing = differences.every((d) => d >= 1 && d <= 3);
	const decreasing = differences.every((d) => d <= -1 && d >= -3);

	return increasing || decreasing;
}