import {readFile} from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'

function getRootDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '..')
}

async function getLines(filename) {
  let rootDir = await getRootDir()
  const content = await readFile(path.resolve(rootDir, filename), 'UTF-8')
  return content.split(/\r?\n/);
}

async function getLinesForDay(year, day, isTest) {
  let rootDir = await getRootDir()
  let filename = `./${year}/day-${day}/${isTest ? 'dataTest.csv': 'data.csv'}`
  const content = await readFile(path.resolve(rootDir, filename), 'UTF-8')
  return content.split(/\r?\n/);
}

function memoize(func) {
  const stored = new Map();

  return (...args) => {
    const k = JSON.stringify(args);
    if (stored.has(k)) {
      return stored.get(k);
    }
    const result = func(...args);
    stored.set(k, result);
    return result;
  };
}

export {getLines, getLinesForDay, memoize}