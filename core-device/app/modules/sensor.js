const dhtsensor = require('node-dht-sensor').promises;

const constants = require('../util/constants.json')

let sen = null

class SensorModule {

    constructor() {
        this._type = constants.SENSOR.TYPE
        this._port = constants.SENSOR.PORT
    }

    init() {
        try {
            sen = dhtsensor.initialize(this._type, this._port);
        } catch (err) {
            console.error(`error initializing sensor connection: ${err}`)
        }
    };

    async readData() {
        try {
            const res = await dhtsensor.read(this._type, this._port);
            let temp = res.temperature.toFixed(1);
            let humidity = res.humidity.toFixed(1);
            return [temp, humidity]
        } catch (err) {
            console.error(`Failed to read sensor data: ${err}`)
        }
    }
}

module.exports = SensorModule