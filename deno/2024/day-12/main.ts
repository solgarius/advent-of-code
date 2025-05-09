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
  return 0;
}


function getKey(plot: Plot): string {
  return `${plot.x},${plot.y}`;
}

function getRegions(farm: Plot[][]): Region[] {
  const regions: Region[] = [];
  for (let i = 0; i < farm.length; i++) {
    console.log(`Row ${i}`);
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
    const neighbours = getNeighbours(currentPlot, farm);
    for (const neighbour of neighbours) {
      if (neighbour.value === plot.value && 
        !region.plots.has(getKey(neighbour)) &&
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

function getEdgeKey(plot1: PlotLoc, plot2: PlotLoc): string {
  if(plot1.x !== plot2.x){
    const x1 = Math.min(plot1.x, plot2.x);
    const x2 = Math.max(plot1.x, plot2.x);
    return `${x1}-${x2},${plot1.y}`;
  }
  const y1 = Math.min(plot1.y, plot2.y);
  const y2 = Math.max(plot1.y, plot2.y);
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
