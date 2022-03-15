const constants = require('./util/constants.json').PUB_SUB
const datetime = require('./util/date-time')

const AwsIotModule = require('./modules/awsiot')
const awsIot = new AwsIotModule()
const SensorModule = require('./modules/sensor')
const sensor = new SensorModule()
const HandleData = require('./modules/handle-data')
const handleData = new HandleData()

const initializeConnections = () => {
    awsIot.init()
    sensor.init()
}

const gatherSensorData = async (espdata = {}) => {
    [temp, humidity] = await sensor.readData()
    // get data as a param from message handler
    // aggregate and format message
    data = {
        "messageType": "response",
        "deviceId": "deviceId",
        "humidity": humidity,
        "temp": temp,
        "level": 10,
        "ts": datetime.getUTCDateTime().toString()
    }
    return JSON.stringify(data)
}

const sendOndemandData = async (payload) => {
    console.log('--- on demand data requested ---')
    awsIot.publishMessage(constants.TOPICS.ESP8266, JSON.stringify({ 'request-data': true }))
    sensordata = await gatherSensorData()
    awsIot.publishMessage(constants.TOPICS.ONDEMAND, sensordata)

}

// stream data to upstream
const sendStreamData = async () => {
    awsIot.publishMessage(constants.TOPICS.ESP8266, JSON.stringify({ 'request-data': true }))
    sensordata = await gatherSensorData()
    awsIot.publishMessage(constants.TOPICS.STREAM, sensordata)
    handleData.writeData(sensordata)
}

async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    initializeConnections()
    setInterval(() => sendStreamData(), 5000)
    setInterval(() => handleData.uploadData(), 7000)
}

module.exports.sendOndemandData = sendOndemandData;
module.exports.gatherSensorData = gatherSensorData;

main().catch(console.error)