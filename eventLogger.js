const path = require('path');
const {format} = require('date-fns');
const {v4 : uuid} = require('uuid');
const fs = require('fs');
const fsPromise = require('fs').promises;


const eventLogger = async function(message, fileName){
    // format date 
    const datetime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    // create log item
    const logItem = `${datetime}\t${uuid()}\t${message}\n`

    try {
        // check if log folder exists
        if(!fs.existsSync(path.join(__dirname, 'logs'))){
            await fsPromise.mkdir(path.join(__dirname, 'logs'))
        }
        // add log details to log file
        await fsPromise.appendFile(path.join(__dirname, 'logs', fileName), logItem) 
    } catch (error) {
        // handle errors
        console.log(error)
    }

}

module.exports = eventLogger