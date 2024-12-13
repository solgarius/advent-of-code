const TEST = false; // Correct = 1793
const filename = TEST ? "./input-test" : "./input";
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll("\r", "").split("\n");
const { guardPosition, objects, numRows, numCols } = parseLines(lines);

type Position = { x: number; y: number; dir?: string };

const p1t0 = performance.now();
const p1Log = part1(guardPosition, objects, numRows, numCols);
const p1t1 = performance.now();
console.log(`Part 1: ${p1Log} (${Math.round(p1t1 - p1t0)}ms)`);

const p2t0 = performance.now();
const p2Log = part2(guardPosition, objects, numRows, numCols);
const p2t1 = performance.now();
console.log(`Part 2: ${p2Log} (${Math.round(p2t1 - p2t0)}ms)`);

function part1(
  guardPosition: Position,
  objects: Set<string>,
  numRows: number,
  numCols: number,
): number {
  const guardPath = getPath(guardPosition, objects, numRows, numCols);
  const visitedPositions: Set<string> = new Set();
  guardPath.forEach((position) => {
    visitedPositions.add(getKey(position));
  });

  return visitedPositions.size;
}

function part2(
  guardPosition: Position,
  objects: Set<string>,
  numRows: number,
  numCols: number,
): number {
  const guardPath = getPath(guardPosition, objects, numRows, numCols);
  const visitedPositions: Set<string> = new Set();
  const guardStartingKey = getKey(guardPosition);
  const visitedPositionDirections: Set<string> = new Set();
  let possibleObjectLocations = 0;
  for (const guardPos of guardPath) {
    visitedPositions.add(getKey(guardPos));
    visitedPositionDirections.add(getDirectionalKey(guardPos));
    const rotatedPosition = {
      ...guardPos,
      dir: getNextDirection(guardPos.dir!),
    };
    const forwardPosition = move(guardPos);
    if (
      !objects.has(getKey(forwardPosition)) && // not an object in the way causing the guard to turn anyway
      !visitedPositions.has(getKey(forwardPosition)) && // placing the object in front can't block a previous path.
      guardStartingKey !== getKey(forwardPosition) && // not the starting position
      willJoinPreviousPath(rotatedPosition, visitedPositionDirections, objects, getKey(forwardPosition))
    ) {
      possibleObjectLocations++;
    }
  }

  return possibleObjectLocations;
}

function willJoinPreviousPath(
  rotatedPosition: Position,
  visitedPositionDirections: Set<string>,
  objects: Set<string>, 
  newObject: string
): boolean {
  let currentPosition = rotatedPosition;
  const newVisitedPositionDirections = new Set(visitedPositionDirections);
  if (newVisitedPositionDirections.has(getDirectionalKey(currentPosition))) { // detected a loop
    return true;
  }
  while (true) {
    const nextPosition = move(currentPosition);
    const nextPosKey = getKey(nextPosition);
    if (
      nextPosition.x < 0 || nextPosition.x >= numRows ||
      nextPosition.y < 0 || nextPosition.y >= numCols
    ) {
      return false;
    } else if (objects.has(nextPosKey) || newObject === nextPosKey) {
        currentPosition.dir = getNextDirection(currentPosition.dir!);
    } else {
      currentPosition = nextPosition;
    }

    const nextDirectionalKey = getDirectionalKey(currentPosition);
    if(newVisitedPositionDirections.has(nextDirectionalKey)){ 
        return true
    }
    newVisitedPositionDirections.add(nextDirectionalKey);
  }
}

function getKey(position: Position): string {
  return `${position.x},${position.y}`;
}

function getDirectionalKey(position: Position): string {
  return `${position.x},${position.y},${position.dir}`;
}

function getNextDirection(dir: string): string {
  const directions = ["up", "right", "down", "left"];
  const currentDirectionIndex = directions.indexOf(dir);
  return directions[(currentDirectionIndex + 1) % directions.length];
}

function getPath(
  guardPosition: Position,
  objects: Set<string>,
  numRows: number,
  numCols: number,
): Position[] {
  const guardPath: Position[] = [];
  let currentPosition = { ...guardPosition };
  while (
    currentPosition.x >= 0 && currentPosition.x < numRows &&
    currentPosition.y >= 0 && currentPosition.y < numCols
  ) {
    guardPath.push({ ...currentPosition });

    const nextPosition = move(currentPosition);

    if (
      nextPosition.x < 0 || nextPosition.x >= numRows ||
      nextPosition.y < 0 || nextPosition.y >= numCols
    ) {
      break;
    } else if (
      objects.has(getKey(nextPosition))
    ) {
      currentPosition.dir = getNextDirection(currentPosition.dir!);
    } else {
      currentPosition = nextPosition;
    }
  }

  return guardPath;
}

function move(position: Position) {
  switch (position.dir) {
    case "up":
      return { ...position, x: position.x - 1 };
    case "right":
      return { ...position, y: position.y + 1 };
    case "down":
      return { ...position, x: position.x + 1 };
    case "left":
      return { ...position, y: position.y - 1 };
    default:
      return position;
  }
}

function parseLines(lines: string[]) {
  let guardPosition: Position = { x: 0, y: 0 };
  const objects: Set<string> = new Set();
  const numRows = lines.length;
  const numCols = lines[0].length;
  lines.forEach((line, rowIndex) => {
    for (let colIndex = 0; colIndex < line.length; colIndex++) {
      if (line[colIndex] === "^") {
        guardPosition = { x: rowIndex, y: colIndex, dir: "up" };
      } else if (line[colIndex] === "#") {
        objects.add(getKey({ x: rowIndex, y: colIndex }));
      }
    }
  });

  return { guardPosition, objects, numRows, numCols };
}
