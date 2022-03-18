const datetime = require('./util/date-time')
const constants = require('./util/constants.json').PUB_SUB

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

/**
 * Aggregates and return sensor data
 * @param {object} espData Published data from esp
 * @param {string} temp Temp returned from dht22
 * @param {string} humidity Humidity returned from dht22
 * @return {object} Return a telemetry object
 */
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

    console.log(`----------temp: ${temp}, humidity: ${humidity}, level: ${espData.level}`)

    if (espData.requestType == 'ondemand') {
        sendOndemandData(data)
    } else if (espData.requestType == 'stream') {
        sendStreamData(data)
    }
}

const sendOndemandData = async (data) => {
    awsIot.publishMessage(constants.TOPICS.ONDEMAND_RES, JSON.stringify(data))
    handleData.writeData(data)
}

const sendStreamData = async (data) => {
    awsIot.publishMessage(constants.TOPICS.STREAM, JSON.stringify(data))
    handleData.writeData(data)
}

/**
 * request ondemand / stream data from esp8266
 * @param {object} payload contains payload.requestType: stream/on-demand
 */
const requestEspData = (payload) => {
    mqtt.publishMessage(constants.TOPICS.ESP8266_REQ, JSON.stringify(payload))
}


async function main() {
    console.log(`********************Starting Core Device App********************`)

    initializeConnections()
    setInterval(() => requestEspData({ requestType: 'stream' }), 5000)
    //TODO: randomize upload time to avoid bandwidth spike
    setInterval(() => handleData.uploadData(), 13000)
}

module.exports.requestEspData = requestEspData;
module.exports.aggregateSensorData = aggregateSensorData;

main().catch(console.error)