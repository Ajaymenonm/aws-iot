const awsiot = require('aws-iot-device-sdk');

const main = require('./main');
let device;

class AwsIotModule {

    static AUTH_CRED = {
        clientId: 'Web-Server',
        host: 'a1suhadvbz0mhg-ats.iot.us-east-1.amazonaws.com',
        port: 8883,
        keyPath: './aws-auth/private.pem.key',
        certPath: './aws-auth/certificate.pem.crt',
        caPath: './aws-auth/AmazonRootCA1.cer',
    }

    async init() {
        try {
            device = await awsiot.device({
                ...AwsIotModule.AUTH_CRED
            })
            device.on('connect', this._subscription)
            device.on('message', this.receiveMessage)
            device.on('error', this.receiveMessage)
        } catch (err) {
            console.error(`error connecting to aws iot: ${err}`)
        }
    };

    _subscription() {
        // Subscribing to topic
        console.log('...web server connected to AWS  IoT Core');
        device.subscribe('store/ondemand/deviceid/res');
        device.subscribe('store/alerts/deviceid');
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

    if (topic == 'store/ondemand/deviceid/res') {
        main.onDemandRes(payload)
    }

    if (topic == 'store/alerts/deviceid') {
        main.alerts(payload)
    }
}

module.exports = AwsIotModule;