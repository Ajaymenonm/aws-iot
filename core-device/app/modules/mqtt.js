const mqtt = require('mqtt');

const main = require('../main');

let client;

class MqttModule {

    async init() {
        try {
            client = mqtt.connect('mqtt://192.168.0.25', { clientId: 'esp8266' })
            client.on('connect', this._subscription)
            client.on('message', this.receiveMessage)
            client.on('error', this._errorEvent)
        } catch (err) {
            console.error(`error connecting to aws iot: ${err}`)
        }
    };

    _subscription() {
        // Subscribing to topics
        console.log('...connected to rpi mqtt broker');
        client.subscribe('store/level/deviceid/res');
    }

    publishMessage(topic, payload) {
        //  TODO: refactor topic nomenclature
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