

const AwsIotModule = require('./modules/awsiot')
const awsIot = new AwsIotModule()
const SensorModule = require('./modules/sensor')
const sensor = new SensorModule()

const initializeConnections = () => {
    awsIot.init()
    sensor.init()
}


async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    initializeConnections()
    setInterval(async () => {
        let sensordata = await sensor.readData()
        awsIot.publishMessage('store/deviceid/stream', sensordata)
    }, 2000)

}

main().catch(console.error)