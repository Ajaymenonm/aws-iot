const awsiot = require('aws-iot-device-sdk');

const main = require('../main');
const constants = require('../util/constants.json').PUB_SUB

let device;

class AwsIotModule {

    static AUTH_CRED = {
        clientId: 'RPi-Core-Device',
        host: 'a1suhadvbz0mhg-ats.iot.us-east-1.amazonaws.com',
        port: 8883,
        keyPath: './aws-auth/private.pem.key',
        certPath: './aws-auth/certificate.pem.crt',
        caPath: './aws-auth/AmazonRootCA1.cer'
    }

    async init() {
        try {
            device = await awsiot.device({
                ...AwsIotModule.AUTH_CRED
            })
            device.on('connect', this._subscription)
            device.on('message', this.receiveMessage)
            device.on('error', this._errorEvent)
        } catch (err) {
            console.error(`error connecting to aws iot: ${err}`)
        }
    };

    _subscription() {
        // Subscribing to topics
        console.log('...connected to AWS  IoT Core');
        device.subscribe(constants.TOPICS.ONDEMAND_REQ);
    }

    publishMessage(topic, payload) {
        device.publish(topic, payload, { qos: 1 });
    }

    receiveMessage(topic, payload) {
        payload = JSON.parse(payload.toString())
        handleMessage(topic, payload)
    }

    _errorEvent(topic, payload) {
        console.log('Error:', topic, payload.toString());
    }
}

const handleMessage = async (topic, payload) => {

    if (topic == constants.TOPICS.ONDEMAND_REQ) {
        console.log('--- on demand data requested ---')
        payload.requestType = 'ondemand' // TODO: add his from webserver request
        main.requestEspData(payload)
    }
}

module.exports = AwsIotModule;