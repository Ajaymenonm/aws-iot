const awsiot = require('aws-iot-device-sdk');

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
            console.log('...Connecting to AWS  IoT Core');
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
        // Subscribing to topics
        device.subscribe('store/deviceid/ondemand');
    }

    publishMessage(topic, payload) {
        device.publish(topic, JSON.stringify({ getOnDemandData: payload }));
    }

    receiveMessage(topic, payload) {
        console.log('message', topic, payload.toString());
    }

    _errorEvent(topic, payload) {
        console.log('Error:', topic, payload.toString());
    }
}

module.exports = AwsIotModule;