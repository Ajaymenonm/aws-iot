const path = require('path')
const fs = require('fs').promises;

const datetime = require('../util/date-time')
const compress = require('../util/compress-data')
const constants = require('../util/constants.json').PUB_SUB

const AwsIotModule = require('../modules/awsiot')
const awsIot = new AwsIotModule()


/**
 * Handle data operations
 * @name HandleData.writeData
 * @param {object} data aggregated sensor data
 */
class HandleData {

    static FILE_DIR = path.join(__dirname, '../data')

    constructor() {
        this._currentfile = `${datetime.getHourForUTCDate()}.csv`
        this._currentfilepath = path.join(HandleData.FILE_DIR, this._currentfile)
    }

    async writeData(data) {
        let filehandle;

        try {
            filehandle = await fs.appendFile(this._currentfilepath, `${data}\n`, 'utf8')
        } catch (err) {
            console.log(`error writing to file: ${err}`)
        } finally {
            if (filehandle !== undefined)
                await filehandle.close();
        }
    }

    async uploadData() {
        let filedata;
        this._currentfile = `${datetime.getHourForUTCDate()}.csv`
        this._currentfilepath = path.join(HandleData.FILE_DIR, this._currentfile)

        try {
            let files = await fs.readdir(HandleData.FILE_DIR)

            files.forEach(async (file) => {
                if (!this._currentfilepath.includes(file)) {                //ignore current file

                    let filepath = path.join(HandleData.FILE_DIR, file);
                    filedata = await fs.readFile(filepath, 'utf8')

                    let compresseddata = await compress.compress(filedata)

                    let telemetry = {
                        compresseddata,
                        file,
                        "deviceid": "deviceid"
                    }

                    awsIot.publishMessage(constants.TOPICS.BATCH, JSON.stringify(telemetry))
                    await fs.unlink(filepath)
                }
            })

            console.log(`---upload to upstream complete`)

        } catch (err) {
            console.error(`error uploading data to upstream: ${err}`)
        }
    }
}

module.exports = HandleData