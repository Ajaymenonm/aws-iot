const fs = require('fs').promises;
const path = require('path')
const compress = require('../util/compress-data')
const datetime = require('../util/date-time')

class HandleData {

    static FILE_DIR = path.join(__dirname, '../data')

    constructor() {
        this._currentfile = datetime.getHourForUTCDate()
        this._filepath = path.join(HandleData.FILE_DIR, this._currentfile);
    }

    async writeData(data) {
        let filehandle;

        try {
            filehandle = await fs.appendFile(this._filepath, `${data}\n`, 'utf8')
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
            let files = await fs.readdir(HandleData.FILE_DIR)
            files.forEach(async (file) => {

                if (!file.includes(this._currentfile)) {
                    let filepath = path.join(HandleData.FILE_DIR, file);
                    filedata = await fs.readFile(filepath, 'utf8')
                    console.log('file -- ', filepath)
                    console.log('cur file -- ', this._filepath)
                    compress.compress(filedata)
                }
            })

            // send upstream
            // delete file
        } catch (err) {
            console.log(`error uploading data to upstream: ${err}`)
        }
    }
}


module.exports = HandleData