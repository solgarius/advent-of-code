const yargs = require('yargs');

const argv = yargs
    .option('d', { description: 'Run advent of code day', type: 'number' })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.d) {
    let day = null
    try {
        day = import(`./day-${argv.d}/day${argv.d}.mjs`)

    } catch (e){
        console.error(`Day ${argv.d} has not been implemented, ${e}`)
    }
    if(day){
        run(day).then(()=>{
            console.log('complete')
            setTimeout(process.exit)
        })

    }
} else {
    yargs.showHelp()
}

async function run(module){
    const day = await module
    return day.run()
}