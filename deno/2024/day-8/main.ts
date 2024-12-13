const TEST = false; // 355 too high

type Position = { x: number; y: number };
type NodeMap = {numCols: number, numRows: number, locations: {[key: string]: Position[]}};

const filename = TEST ? "./input-test" : "./input";
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll("\r", "").split("\n");
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
  data: NodeMap,
): number {
  const { numRows, numCols, locations } = data;
  let antinodes: Set<string> = new Set();
  for (const key in locations) {
    const positions = locations[key];

    const keyAntinodes = getAntinodes(numRows, numCols, positions, false)
    keyAntinodes.forEach((pos) => antinodes.add(pos));
  }
  return antinodes.size;
}

function part2(
  data: NodeMap,
): number {
  const { numRows, numCols, locations } = data;
  let antinodes: Set<string> = new Set();
  for (const key in locations) {
    const positions = locations[key];

    const keyAntinodes = getAntinodes(numRows, numCols, positions, true)
    keyAntinodes.forEach((pos) => antinodes.add(pos));
  }
  return antinodes.size;
}

function antinodesWithinBounds(pos: Position, numCols: number, numRows: number): boolean {
  return pos.x >= 0 && pos.x < numCols && pos.y >= 0 && pos.y < numRows;
}

function getAntinodes(numRows: number, numCols: number, positions: Position[], allHarmonics: boolean): Set<string> {
  const antinodes: Set<string> = new Set();
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const pos1 = positions[i];
      const pos2 = positions[j];
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const possibleAntinodes: {x:number, y:number}[] = [];
      if(!allHarmonics){
        possibleAntinodes.push({ x: pos1.x - dx, y: pos1.y - dy });
        possibleAntinodes.push({ x: pos2.x + dx, y: pos2.y + dy });
      } else {
        let k = 0;
        while (true) {
          const newPos1 = { x: pos1.x + k * dx, y: pos1.y + k * dy };
          const newPos2 = { x: pos2.x - k * dx, y: pos2.y - k * dy };
          if (!antinodesWithinBounds(newPos1, numCols, numRows) && !antinodesWithinBounds(newPos2, numCols, numRows)) {
            break;
          }
          if (antinodesWithinBounds(newPos1, numCols, numRows)) {
            possibleAntinodes.push(newPos1);
          }
          if (antinodesWithinBounds(newPos2, numCols, numRows)) {
            possibleAntinodes.push(newPos2);
          }
          k++;
        }
      }
      for(const possibleAntinode of possibleAntinodes){
        if (antinodesWithinBounds(possibleAntinode, numCols, numRows)) {
          antinodes.add(getKey(possibleAntinode));
        }
      }
    }
  }
  return antinodes
}


function getKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function parseLines(lines: string[]): NodeMap {
  const numRows = lines.length;
  const numCols = lines[0].length;
  const locations: { [key: string]: Position[] } = {};

  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      const char = lines[y][x];
      if (char !== '.') {
        if (!locations[char]) {
          locations[char] = [];
        }
        locations[char].push({ x, y });
      }
    }
  }

  return { numRows, numCols, locations };
}
