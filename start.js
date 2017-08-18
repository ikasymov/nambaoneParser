let glob = require('glob');
let dirs = glob.sync('./parsers/*.js');

async function start(){

    for (let i in dirs){
        await require(dirs[i]).startpars()
    }
    console.log('stop')
}

start()

