const mqtt = require('mqtt');

const main = require('../main');

let client;

class MqttModule {

    async init() {
        try {
            console.log('...Connecting to RPi Mqtt broker');
            // client = mqtt.connect('mqtt://192.168.1.157', { clientId: 'esp8266' })
            client = mqtt.connect('mqtt://test.mosquitto.org')
            client.on('connect', this._subscription)
            client.on('message', this.receiveMessage)
            client.on('error', this._errorEvent)
        } catch (err) {
            console.error(`error connecting to aws iot: ${err}`)
        }
    };

    _subscription() {
        // Subscribing to topics
        console.log('---connected to mqtt broker');
        client.subscribe('store/level/deviceid/res');
    }

    publishMessage(topic, payload) {
        //  TODO: refactor topic nomenclature
        client.publish('store/level/deviceid/req', payload, { qos: 1 });
    }

    receiveMessage(topic, payload) {
        payload = JSON.parse(payload.toString())
        main.gatherSensorData(payload)
    }

    _errorEvent() {
        console.log(`error in mqtt connection`);
    }
}


module.exports = MqttModule;