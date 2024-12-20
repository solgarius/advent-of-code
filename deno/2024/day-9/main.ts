const TEST = false;
const DEBUG = false;

const filename = TEST ? "./input-test" : "./input";
const file = await Deno.readTextFile(filename);
const lines = file.replaceAll("\r", "").split("\n");
const { numbers } = parseLines(lines);
class ListNode {
  id: number;
  length: number;
  endNode: boolean = false;
  next: ListNode | null = null;
  prev: ListNode | null = null;

  constructor(id: number, length: number) {
    this.id = id;
    this.length = length;
  }

  splitNode(newFirstId: number, newFirstLength: number): boolean {
    if (newFirstLength > this.length) {
      return false;
    } else if (newFirstLength === this.length) {
      this.id = newFirstId;
      return true;
    }
    let newNode = new ListNode(newFirstId, newFirstLength);
    this.length = this.length - newFirstLength;
    if (this.prev) {
      this.prev.next = newNode;
    }
    newNode.prev = this.prev;
    newNode.next = this;
    this.prev = newNode;
    return true;
  }

  merge(this: ListNode): boolean {
    let merged = false;
    if (this.next && this.id === this.next.id && !this.next.endNode) {
      this.length += this.next.length;
      this.next = this.next.next;
      if (this.next) {
        this.next.prev = this;
      }
      merged = true;
    }
    if (this.prev && this.id === this.prev.id && !this.prev.endNode) {
      this.prev.length += this.length;
      this.prev.next = this.next;
      if (this.next) {
        this.next.prev = this.prev;
      }
      merged = true;
    }
    return merged;
  }
}

class NodeLinkedList {
  head: ListNode = new ListNode(-1, 0);
  tail: ListNode = new ListNode(-1, 0);

  constructor() {
    this.head.endNode = true;
    this.tail.endNode = true;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  getListLength(): number {
    let length = 0;
    let current = this.getHead();
    while (current !== this.tail) {
      if (current !== this.head && current !== this.tail) {
        length++;
      }
      current = current.next!;
    }
    return length;
  }

  getLength(): number {
    let length = 0;
    let current = this.getHead();
    while (current !== this.tail) {
      length += current.length;
      current = current.next!;
    }
    return length;
  }

  addNode(id: number, length: number) {
    const newNode = new ListNode(id, length);
    if (this.head.next === this.tail) {
      this.head.next = newNode;
    }
    newNode.prev = this.tail.prev;
    newNode.next = this.tail;
    if (this.tail.prev) {
      this.tail.prev.next = newNode;
    }
    this.tail.prev = newNode;
  }

  getHead(): ListNode {
    return this.head.next || this.head;
  }

  getTail(): ListNode {
    return this.tail.prev || this.tail;
  }

  addBefore(node: ListNode, before: ListNode) {
    if (node === before) {
      return;
    }
    if (node === this.head || node === this.tail) {
      return;
    }
    if (before === this.head || before === this.tail) {
      return;
    }
    node.prev = before.prev;
    node.next = before;
    if (before.prev) {
      before.prev.next = node;
    }
    before.prev = node;
  }

  printList() {
    if (!DEBUG) { return }
    let current = this.head.next || new ListNode(-1, 0);
    let str = ''
    while (current !== this.tail) {
      if (current.id < 0) {
        str += '.'.repeat(current.length);
      } else {
        str += (current.id + '').repeat(current.length);
      }
      str += ' ';
      current = current.next!;
    }
    console.log(this.getListLength(), this.getLength(), str);
  }
}


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
  let list = new NodeLinkedList();
  for (let i = 0; i < numbers.length; i++) {
    list.addNode(i % 2 === 0 ? id++ : -1, numbers[i]);
  }

  list.printList();
  let curTail: ListNode | null = list.getTail();
  let cur: ListNode | null = list.getHead();
  while (curTail) {
    if (curTail.id >= 0) {
      if (moveToEmptyBlock(curTail, list)) {
        list.printList();
      }
    }
    curTail = curTail.prev;

  }

  list.printList();

  let score = 0;
  let index = 0;
  cur = list.getHead();
  while (cur) {
    if (cur.id >= 0) {
      for (let i = 0; i < cur.length; i++) {
        score += index * cur.id;
        index++;
      }
    } else {
      index += cur.length;
    }
    cur = cur.next;
  }
  return score;
}

function moveToEmptyBlock(node: ListNode, list: NodeLinkedList): boolean {
  let cur = list.getHead();
  let moved = false;
  while (cur !== node) {
    if (cur.id === -1 && cur.length >= node.length) {
      cur.splitNode(node.id, node.length);
      node.id = -1;
      node.merge();
      cur.merge();
      moved = true;
      break;
    }
    cur = cur.next!;
  }
  return moved;
}

function parseLines(lines: string[]): { numbers: number[] } {
  const input = lines[0];
  const numbers = input.split("").map(Number);
  return { numbers };
}
