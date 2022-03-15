const fs = require('fs').promises;
const path = require('path')
const datetime = require('../util/date-time')

class HandleData {

    static FILE_DIR = path.join(__dirname, '../data')

    constructor() {
        this._currentfile = datetime.getHourForUTCDate()
        this._filepath = path.join(HandleData.FILE_DIR, `${this._currentfile}.csv`);
    }

    async writeData(data) {
        let filehandle;

        try {
            filehandle = await fs.appendFile(this._filepath, data, 'utf8')
        } catch (err) {
            console.log(`error writing to file: ${err}`)
        } finally {
            if (filehandle !== undefined)
                await filehandle.close();
        }
    }

    async uploadData() {
        let filedata;

        try {
            this._currentfile = datetime.getHourForUTCDate()
            filedata = await fs.readFile(this._filepath, 'utf8')
            console(filedata)
            // compress data
            // send upstream
            // delete file
        } catch (err) {
            console.log(`error uploading data to upstream: ${err}`)
        }
    }

}


module.exports = HandleData