const constants = require('./util/constants.json').PUB_SUB
const datetime = require('./util/date-time')

const AwsIotModule = require('./modules/awsiot')
const awsIot = new AwsIotModule()
const SensorModule = require('./modules/sensor')
const sensor = new SensorModule()
const HandleData = require('./modules/handle-data')
const handleData = new HandleData()
const MqttModule = require('./modules/mqtt')
const mqtt = new MqttModule()

const initializeConnections = () => {
    awsIot.init()
    sensor.init()
    mqtt.init()
}

const aggregateSensorData = async (espData) => {
    [temp, humidity] = await sensor.readData()
    data = {
        "messageType": "response",
        "requestType": espData.requestType,
        "deviceId": "deviceId",
        "humidity": humidity,
        "temp": temp,
        "level": espData.level,
        "ts": datetime.getUTCDateTime().toString()
    }

    console.log(`temp: ${temp}, humidity: ${humidity}, level: ${level}`)

    if (espData.requestType == 'ondemand') {
        sendOndemandData(data)
    } else if (espData.requestType == 'stream') {
        sendStreamData(data)
    }
}

// send data on demand request
const sendOndemandData = async (data) => {
    awsIot.publishMessage(constants.TOPICS.ONDEMAND, JSON.stringify(data))
    handleData.writeData(data)
}

// stream data to upstream
const sendStreamData = async (data) => {
    awsIot.publishMessage(constants.TOPICS.STREAM, JSON.stringify(data))
    handleData.writeData(data)
}

// request ondemand / stream data from esp8266
const requestEspData = (payload) => {
    mqtt.publishMessage(constants.TOPICS.ESP8266_REQ, JSON.stringify(payload))
}

async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    initializeConnections()
    setInterval(() => requestEspData({ requestType: 'stream' }), 5000)
    setInterval(() => handleData.uploadData(), 13000)
}

module.exports.requestEspData = requestEspData;
module.exports.aggregateSensorData = aggregateSensorData;

main().catch(console.error)