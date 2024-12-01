
const TEST = true
const filename = TEST ? './input-test' : './input';
const file = await Deno.readTextFile(filename);
const lines = file.split('\n');
console.log(lines);
