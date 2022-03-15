const constants = require('./util/constants.json').PUB_SUB

const AwsIotModule = require('./modules/awsiot')
const awsIot = new AwsIotModule()
const SensorModule = require('./modules/sensor')
const sensor = new SensorModule()

const initializeConnections = () => {
    awsIot.init()
    sensor.init()
}

const sendOndemandData = async (payload) => {
    [temp, humidity] = await sensor.readData()
    // get data from esp8266
    // aggregate and format message
    data = {
        "messageType": "response",
        "deviceId": "deviceId",
        "dht22": temp,
        "temp": humidity
    }
    awsIot.publishMessage(constants.TOPICS.ONDEMAND, data)
}

async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    initializeConnections()
    setInterval(async () => {
        let sensordata = await sensor.readData()
        let aws = awsIot.publishMessage(constants.TOPICS.STREAM, sensordata)
        console.log('--------aws: ', aws)
    }, 5000)

}

module.exports.sendOndemandData = sendOndemandData;

main().catch(console.error)