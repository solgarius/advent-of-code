import ms from 'ms';

function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet(ms(100000)));
  