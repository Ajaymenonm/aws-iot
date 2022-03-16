const constants = require('./util/constants.json').PUB_SUB
const datetime = require('./util/date-time')

const AwsIotModule = require('./modules/awsiot')
const awsIot = new AwsIotModule()
const SensorModule = require('./modules/sensor')
const sensor = new SensorModule()
const HandleData = require('./modules/handle-data')
const handleData = new HandleData()
const MqttModule = require('../app/modules/mqtt')
const mqtt = new MqttModule()

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

const requestData = async () => {
    // mqtt.publishMessage(constants.TOPICS.ESP8266_REQ, JSON.stringify({ 'request-data': true }))
    const sensordata = await gatherSensorData()
    handleData.writeData(sensordata)
    return sensordata
}

const sendOndemandData = async () => {
    console.log('--- on demand data requested ---')
    let telemetry = await requestData()
    awsIot.publishMessage(constants.TOPICS.ONDEMAND, telemetry)
}

// stream data to upstream
const sendStreamData = async () => {
    let telemetry = await requestData()
    awsIot.publishMessage(constants.TOPICS.STREAM, telemetry)
}

async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    initializeConnections()
    setInterval(() => sendStreamData(), 5000)
    setInterval(() => handleData.uploadData(), 13000)
}

module.exports.sendOndemandData = sendOndemandData;
module.exports.gatherSensorData = gatherSensorData;

main().catch(console.error)