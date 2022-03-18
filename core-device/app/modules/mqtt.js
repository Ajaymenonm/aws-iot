const mqtt = require('mqtt');

const main = require('../main');
const constants = require('../util/constants.json')

let client;

/**
 * Connect and perform mosquitto mqtt operations
 * @name MqttModule.publishMessage
    * @param {string} topic topic where to publish message
    * @param {object} payload payload to publish

* @name MqttModule.receiveMessage
    * @param {string} topic topic message received
    * @param {object} payload payload received
 */
class MqttModule {

    async init() {
        try {
            client = mqtt.connect(`mqtt://${constants.MQTT_IP}`, { clientId: 'temp-humidity' })
            client.on('connect', this._subscription)
            client.on('message', this.receiveMessage)
            client.on('error', this._errorEvent)
        } catch (err) {
            console.error(`error connecting to aws iot: ${err}`)
        }
    };

    _subscription() {
        console.log('...connected to rpi mqtt broker');
        client.subscribe(constants.PUB_SUB.TOPICS.ESP8266_RES);
    }

    publishMessage(topic, payload) {
        client.publish(topic, payload, { qos: 1 });
    }

    receiveMessage(topic, payload) {
        payload = JSON.parse(payload.toString())
        main.aggregateSensorData(payload)
    }

    _errorEvent() {
        console.log(`error in mqtt connection`);
    }
}

module.exports = MqttModule;