const TEST = false;

type Data = {
  topographicalMap: number[][];
};

type TrailHeadRoutes = {
  [key: string]: number;
};

type TrailMap = {
  [key: string]: TrailHeadRoutes;
};

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
  data: Data,
): number {
  const trailMap = getTrailMap(data.topographicalMap);
  let trails = 0;
  for (const key in trailMap) {
    trails += Object.keys(trailMap[key]).length;
  }
  return trails;
}

function part2(
  data: Data,
): number {
  const trailMap = getTrailMap(data.topographicalMap);
  let trails = 0;
  for (const key in trailMap) {
    for (const trailKey in trailMap[key]) {
      trails += trailMap[key][trailKey];
    }
  }
  return trails;
}

function getTrailheads(
  topographicalMap: number[][],
): { x: number; y: number }[] {
  const width = topographicalMap[0].length;
  const height = topographicalMap.length;
  const trailheads = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (topographicalMap[y][x] === 0) {
        trailheads.push({ x, y });
      }
    }
  }
  return trailheads;
}

function getTrailMap(topographicalMap: number[][]): TrailMap {
  const trailMap = <TrailMap> {};
  const trailheads = getTrailheads(topographicalMap);
  for (const trailhead of trailheads) {
    const trailEnds = getTrailsDFS(
      trailhead.x,
      trailhead.y,
      -1,
      topographicalMap,
    );
    trailMap[getKey(trailhead.x, trailhead.y)] = trailEnds;
  }
  return trailMap;
}

function getTrailsDFS(
  x: number,
  y: number,
  prevValue: number,
  topographicalMap: number[][],
): TrailHeadRoutes {
  if (
    x < 0 || y < 0 ||
    x >= topographicalMap[0].length ||
    y >= topographicalMap.length ||
    topographicalMap[y][x] !== prevValue + 1
  ) {
    return {};
  }

  if (topographicalMap[y][x] === 9) {
    return { [getKey(x, y)]: 1 };
  }

  const currentValue = topographicalMap[y][x];
  //  topographicalMap[y][x] = -1; // mark as visited
  const trails = <TrailHeadRoutes> {};
  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  for (const { dx, dy } of directions) {
    const nextTrails = getTrailsDFS(
      x + dx,
      y + dy,
      currentValue,
      topographicalMap,
    );
    for (const [key, value] of Object.entries(nextTrails)) {
      if (trails[key]) {
        trails[key] += value;
      } else {
        trails[key] = value;
      }
    }
  }

  //topographicalMap[y][x] = currentValue; // unmark
  return trails;
}
function getKey(x: number, y: number): string {
  return `${x},${y}`;
}
function parseLines(lines: string[]): Data {
  let topographicalMap = [];
  topographicalMap = lines.map((line) => line.split("").map(Number));
  return { topographicalMap };
}
