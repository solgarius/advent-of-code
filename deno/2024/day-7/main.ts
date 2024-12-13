const TEST = false;
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

type Equation = { target: number, inputs: number[] };

function part1(
  equations: Equation[],
): number {
  let totalScore = 0;
  for (const equation of equations) {
    if (canInputsEquateToTarget(equation)) {
      totalScore += equation.target;
    }
  }
  return totalScore;
}

function part2(
  equations: Equation[],
): number {
  let totalScore = 0;
  for (const equation of equations) {
    if (canInputsEquateToTarget(equation, ['+','*','||'])) {
      totalScore += equation.target;
    }
  }
  return totalScore;
}


function canInputsEquateToTarget(equation: Equation, operators: string[] = ["+", "*"]): boolean {
  const inputs = equation.inputs;
  const target = equation.target;

  const operatorCombinations = generateOperatorCombinations(inputs.length - 1, operators);
  for (const operatorCombination of operatorCombinations) {
    if (evaluateExpression(inputs, operatorCombination) === target) {
      return true;
    }
  }
  return false;
}

function evaluateExpression(inputs: number[], operators: string[]): number {
  let result = inputs[0];
  for (let i = 1; i < inputs.length; i++) {
    const operator = operators[i - 1];
    if (operator === "+") {
      result += inputs[i];
    } else if (operator === "*") {
      result *= inputs[i];
    } else if (operator === "||") {
      result = Number(result.toString() + inputs[i].toString());
    }
  }
  return result;
}

function generateOperatorCombinations(length: number, operators: string[]): string[][] {
  if (length === 1) return operators.map(op => [op]);
  const combinations: string[][] = [];
  const smallerCombinations = generateOperatorCombinations(length - 1, operators);
  for (const op of operators) {
    for (const smallerCombination of smallerCombinations) {
      combinations.push([op, ...smallerCombination]);
    }
  }
  return combinations;
}


function parseLines(lines: string[]): Equation[] {
  return lines.map(line => {
    const [target, inputs] = line.split(":");
    return {
      target: Number(target.trim()),
      inputs: inputs.trim().split(" ").map(Number)
    };
  });
}
