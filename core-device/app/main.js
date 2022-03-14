const dhtsensor = require('node-dht-sensor').promises;

const AwsIotModule = require('./modules/awsiot')
const awsIot = new AwsIotModule()


const initializeConnections = () => {
    awsIot.init()
}


const readSensorData = () => {
    try {
        // 22 -> dht22 sensor; 4 -> gpio pin
        // const res = await dhtsensor.read(22, 4);
        // let temp = res.temperature.toFixed(1);
        // let humidity = res.humidity.toFixed(1);
        // console.log(`Temp: ${temp}, Humidity: ${humidity}`)
        console.log(`Temp: 10, Humidity: 20`)
        return `Temp: 10, Humidity: 20`
    } catch (err) {
        console.error(`error reading sensor data: ${err}`)
    }
}

async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    initializeConnections()
    setInterval(() => {
        let sensordata = readSensorData()
        awsIot.publishMessage('store/deviceid/stream', sensordata)
    }, 2000)

}

main().catch(console.error)