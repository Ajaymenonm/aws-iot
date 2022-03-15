const dhtsensor = require('node-dht-sensor').promises;

let sen = null

class SensorModule {

    constructor(sensortype, port) {
        this._sensortype = sensortype
        this._port = port
    }

    init() {
        try {
            // sen = dhtsensor.initialize(this._sensortype, this._sensortype);
            console.log(`initialized sensor: ${sen}`)
        } catch (err) {
            console.error(`error initializing sensor connection: ${err}`)
        }
    };

    async readData() {
        try {
            // const res = await dhtsensor.read(this._sensortype, this._sensortype);
            // let temp = res.temperature.toFixed(1);
            // let humidity = res.humidity.toFixed(1);
            console.log(`Temp: 10, Humidity: 20`)
            return `Temp: 10, Humidity: 20`
        } catch (err) {
            console.error(`Failed to read sensor data: ${err}`)
        }
    }
}

module.exports = SensorModule