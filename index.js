const { performance } = require('perf_hooks')
const ms = require('ms')
const yargs = require('yargs')
const fs = require('fs')

const argv = yargs
  .option('d', { description: 'Run advent of code day', type: 'string' })
  .option('y', { description: 'Run advent of code year', type: 'string' })
  .option('t', { description: 'test mode', type: 'boolean' })
  .help()
  .alias('help', 'h')
  .argv;

let year = argv.y || 2023

if (argv.d) {
  let day = null

  let filePath = `./${year}/day-${argv.d}/day.mjs`;
  if (!checkFileExists(filePath)) {
    filePath = `./${year}/day-${argv.d}/day${argv.d}.mjs`;
    if (!checkFileExists(filePath)) {
      console.error(`Day ${argv.d} has not been implemented yet`)
      setTimeout(process.exit)
    }
  }
  day = import(filePath)
  run(day, year, argv.d).then((output) => {
    console.log(`completed in ${ms(output.total)}  module load: ${ms(output.moduleLoad)} file load: ${ms(output.fileLoad)} code time: ${ms(output.codeExec)}`)
    setTimeout(process.exit)
  })
  .catch((error) => {
    console.error(error)
    setTimeout(process.exit)
  })
} else {
  yargs.showHelp()
}

async function run(module, yearNum, dayNum) {
  const t0 = performance.now()
  const day = await module
  const t1 = performance.now()
  const util = await import('./util/utility.mjs')
  const lines = await util.getLinesForDay(yearNum, dayNum, argv.t)
  const t2 = performance.now()
  const result = await day.run(lines, argv.t)
  const t3 = performance.now()
  return { result, moduleLoad: Math.round(t1 - t0), fileLoad: Math.round(t2 - t1), codeExec: Math.round(t3 - t2), total: Math.round(t3 - t0) }
}

function checkFileExists(filePath) {
  try {
    fs.statSync(filePath);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    } else {
      throw err;
    }
  }
}
