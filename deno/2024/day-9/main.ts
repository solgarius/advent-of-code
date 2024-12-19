const TEST = false;

const filename = TEST ? "./input-test" : "./input";
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll("\r", "").split("\n");
const { numbers } = parseLines(lines);

const p1t0 = performance.now();
const p1Log = part1(numbers);
const p1t1 = performance.now();
console.log(`Part 1: ${p1Log} (${Math.round(p1t1 - p1t0)}ms)`);

const p2t0 = performance.now();
const p2Log = part2(numbers);
const p2t1 = performance.now();
console.log(`Part 2: ${p2Log} (${Math.round(p2t1 - p2t0)}ms)`);

function part1(
  numbers: number[],
): number {
  let score = 0;
  let totalMem = numbers.reduce((acc, num) => acc + num, 0);
  let memArry: number[] = new Array(totalMem).fill(-1);
  let id = 0;
  let memIndex = 0;
  for (let i = 0; i < numbers.length; i++) {
    if (i % 2 === 0) {
      for (let j = 0; j < numbers[i]; j++) {
        memArry[memIndex] = id;
        memIndex++;
      }
      id++;
    } else {
      memIndex += numbers[i];
    }
  }
  let lastFoundId = memArry.length - 1;
  for (let i = 0; i < memArry.length; i++) {
    if (memArry[i] === -1) {
      for (let j = lastFoundId; j > i; j--) {
        if (memArry[j] >= 0) {
          memArry[i] = memArry[j];
          memArry[j] = -1;
          lastFoundId = j;
          break;
        }
      }
    }
  }
  for (let i = 0; i < memArry.length; i++) {
    if (memArry[i] >= 0) {
      score += i * memArry[i];
    }
  }
  return score;
}

function part2(
  numbers: number[],
): number {
  let id = 0;

  let head: ListNode | null = null;
  let tail: ListNode | null = null;

  for (let i = 0; i < numbers.length; i++) {
    const newNode = new ListNode(i % 2 === 0 ? id++ : -1, numbers[i]);
    if (!head) {
      head = newNode;
      tail = newNode;
    } else {
      tail!.next = newNode;
      newNode.prev = tail;
      tail = newNode;
    }
  }

  // Example of traversing the list
  let current = head;
  let currentTail = tail;
  let score = 0;
  let index = 0;

  while (current) {
    if (current.id < 0) {
      let tailLen = currentTail?.length || 0;
      if (tailLen < current.length) {
        current.length -= tailLen;
        for (let i = 0; i < tailLen; i++) {
          score += index * currentTail!.id;
          index++;
        }
        if (currentTail) {
          currentTail.id = -1;
        }
        currentTail = currentTail?.prev?.prev || null;
      }
    } else {
      for (let i = 0; i < current.length || 0; i++) {
        score += index * current.id; 
        index++;
        current = current.next;
    }
  }
  return score;
}

class ListNode {
  id: number;
  length: number;
  next: ListNode | null = null;
  prev: ListNode | null = null;

  constructor(id: number, length: number) {
    this.id = id;
    this.length = length;
  }
}

function parseLines(lines: string[]): { numbers: number[] } {
  const input = lines[0];
  const numbers = input.split("").map(Number);
  return { numbers };
}
