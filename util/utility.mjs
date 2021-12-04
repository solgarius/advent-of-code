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

export {getLines}