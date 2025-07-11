const TEST = false;
const filename = TEST ? "./input-test" : "./input";

type Plot = {
  x: number;
  y: number;
  value: string;
  commonNeighbours: Plot[];
  regionEdges: string[];
}
type PlotLoc = {
  x: number;
  y: number;
}

type Region = {
  value: string;
  plots: Map<string,Plot>;
}



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
  data: object,
): number {
  const { farm } = data as { farm: Plot[][] };
  let score = 0;
  const regions = getRegions(farm);
  console.log(`Found ${regions.length} regions`);
  for(const region of regions) {
    const edges = getEdges(region);
    // console.log(`Region ${region.value} has ${edgeCount} * ${region.plots.size} = ${edgeCount * region.plots.size}`);
    score += edges.length * region.plots.size;
  }
  return score;
}

function part2(
  data: object,
): number {
  const { farm } = data as { farm: Plot[][] };
  let score = 0;
  const regions = getRegions(farm);
  console.log(`Found ${regions.length} regions`);
  for(const region of regions) {
    const edges = getEdges(region);
    const sides = getSides(edges);
    console.log(`Region ${region.value} has ${sides.length} * ${region.plots.size} = ${sides.length * region.plots.size}`);
    score += sides.length * region.plots.size;
  }
  return score;
}


function getKey(plot: Plot): string {
  return `${plot.x},${plot.y}`;
}

function getRegions(farm: Plot[][]): Region[] {
  const regions: Region[] = [];
  for (let i = 0; i < farm.length; i++) {
    for (let j = 0; j < farm[i].length; j++) {
      const plot = farm[i][j];
      if(!isInRegion(plot, regions)){
        regions.push(getRegion(plot, farm))
      }
    }
  }
  return regions;
}

function isInRegion(plot: Plot, regions: Region[]): boolean {
  for (const region of regions) {
    if (region.plots.has(getKey(plot))) {
      return true;
    }
  }
  return false;
}

function getRegion(plot: Plot, farm: Plot[][]): Region {
  const region: Region = {
    value: plot.value,
    plots: new Map<string, Plot>(),
  };
  const queue: Plot[] = [plot];
  while (queue.length > 0) {
    const currentPlot = queue.shift()!;
    const key = getKey(currentPlot);
    if(!region.plots.has(key)){
      region.plots.set(key, currentPlot);
    }
    for (const neighbour of currentPlot.commonNeighbours) {
      if (!region.plots.has(getKey(neighbour)) &&
        !queue.includes(neighbour)) {
        queue.push(neighbour);
      }
    }
  }
  return region;
}

function getEdges(region: Region): string[] {
  const edges: string[] = [];
  for (const plot of region.plots.values()) {
    edges.push(...plot.regionEdges);
  }
  return edges;
}

/**
 * Merges together consecutive edges so that they are merged into a single side. 
 * For example 1,1-2 & 1,2-3 transforms to 1,1-3 
 * @param edges The 1 length edge around a shape on an x/y 2d grid.
 * @returns 
 */
export function getSides(edges: string[]): string[] {
  const sides: string[] = [];
  const xEdges: Map<string, number[]> = new Map();
  const yEdges: Map<string, number[]> = new Map();
  for (const edge of edges) {
    const [x, y] = edge.split(",");
    if(x.indexOf("-")>=0){
      if(!xEdges.has(x)){
        xEdges.set(x, []);
      }
      xEdges.get(x)?.push(parseInt(y));
    } else if(y.indexOf("-")>=0){
      if(!yEdges.has(y)){
        yEdges.set(y, []);
      }
      yEdges.get(y)?.push(parseInt(x));
    }
  }
  for (const [xRange, yValues] of xEdges) {
    yValues.sort((a, b) => a - b);
    let startY = yValues[0];
    let endY = yValues[0];
    for (let i = 1; i < yValues.length; i++) {
      if (yValues[i] === endY + 1) {
        endY = yValues[i];
      } else {
        sides.push(`${xRange},${startY}-${endY}`);
        startY = yValues[i];
        endY = yValues[i];
      }
    }
    sides.push(`${xRange},${startY}-${endY}`);
  }

  for (const [yRange, xValues] of yEdges) {
    xValues.sort((a, b) => a - b);
    let startX = xValues[0];
    let endX = xValues[0];
    for (let i = 1; i < xValues.length; i++) {
      if (xValues[i] === endX + 1) {
        endX = xValues[i];
      } else {
        sides.push(`${startX}-${endX},${yRange}`);
        startX = xValues[i];
        endX = xValues[i];
      }
    }
    sides.push(`${startX}-${endX},${yRange}`);
  }

  return sides;
}

function getEdgeKey(plot1: PlotLoc, plot2: PlotLoc): string {
  if(plot1.x !== plot2.x){
    const x1 = plot1.x;
    const x2 = plot2.x;
    return `${x1}-${x2},${plot1.y}`;
  }
  const y1 = plot1.y;
  const y2 = plot2.y;
  return `${plot1.x},${y1}-${y2}`;
}

function parseLines(lines: string[]): object {
  const farm: Plot[][] = [];
  for(let y = 0; y < lines.length; y++){
    const line = lines[y];
    const plots: Plot[] = [];
    const strs = line.split("");
    for(let x =0; x < strs.length; x++){
      plots.push({ x, y, value: strs[x], commonNeighbours: [], regionEdges: []});
    }
    farm.push(plots);
  }
  for(let y = 0; y < farm.length; y++){
    const plots = farm[y];
    for(let x =0; x < plots.length; x++){
      const plot = plots[x];
      const directions = [  
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 }, // right
        { dx: 0, dy: 1 }, // down
        { dx: -1, dy: 0 }, // left
      ];
      for (const { dx, dy } of directions) {
        const newX = plot.x + dx;
        const newY = plot.y + dy;
        const newPlot = farm[newY]?.[newX];
        if (newPlot && newPlot.value === plot.value) {
          plot.commonNeighbours.push(newPlot);
        } else {
          plot.regionEdges.push(getEdgeKey(plot, {x:newX, y:newY}));
        }
      }
    }
  }
  return {farm}
}
