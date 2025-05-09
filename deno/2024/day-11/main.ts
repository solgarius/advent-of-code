const TEST = false;
const filename = TEST ? "./input-test" : "./input";
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll("\r", "").split("\n");

const _splitMem = new Map<string, number>();

const data = parseLines(lines);

const p1t0 = performance.now();
const p1Log = part1(data);
const p1t1 = performance.now();
console.log(`Part 1: ${p1Log} (${Math.round(p1t1 - p1t0)}ms)`);

const p2t0 = performance.now();
const p2Log = part2(data);
const p2t1 = performance.now();
console.log(`Part 2: ${p2Log} (${Math.round(p2t1 - p2t0)}ms)`);

function part1(
  data: object,
): number {
  const { numbers } = data as { numbers: number[] };
  let result = 0;
  for(const num of numbers) {
    result += runSplitStones(num, 25);
  }
  return result;
}

function part2(
  data: object,
): number {
  const { numbers } = data as { numbers: number[] };
  let result = 0;
  for(const num of numbers) {
    result += runSplitStones(num, 75);
  }
  return result;
}

function runSplitStones(splitNum: number, iterations: number): number {
  const key = `${splitNum}-${iterations}`;
  if( _splitMem.has(key)) {
    return _splitMem.get(key) as number;
  }
  if (iterations <= 0) return 0;
  const splitNums = splitStones(splitNum);
  if (iterations === 1) {
    _splitMem.set(key, splitNums.length);
    return splitNums.length;
  }
  let result = 0;
  for (const num of splitNums) {
    result += runSplitStones(num, iterations - 1);
  }
  _splitMem.set(key, result);
  return result;
}

function splitStones(number: number): number[] {
  const result = [];
  const numberStr = number.toString();
  if (number === 0) {
    result.push(1);
  } else if (numberStr.length % 2 === 0) {
    const half = numberStr.length / 2;
    const firstHalf = numberStr.slice(0, half);
    const secondHalf = numberStr.slice(half);
    result.push(Number(firstHalf));
    result.push(Number(secondHalf));
  } else {
    result.push(number * 2024);
  }
  return result;
}

function parseLines(lines: string[]): object {
  const numbers = lines[0].split(" ").map(Number);
  return { numbers };
}
