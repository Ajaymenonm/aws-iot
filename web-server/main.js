const awsiot = require('aws-iot-device-sdk');

const device = awsiot.device({
    clientId: 'Web-Server',
    host: 'a1suhadvbz0mhg-ats.iot.us-east-1.amazonaws.com',
    port: 8883,
    keyPath: './aws-auth/private.pem.key',
    certPath: './aws-auth/certificate.pem.crt',
    caPath: './aws-auth/AmazonRootCA1.cer',
});

device
    .on('connect', () => {
        console.log('Connecting to AWS  IoT Core');
        // setInterval(() => getSensorData(sendData), 3000)
        // device.subscribe('store/deviceid/sendingdata');
        device.publish('store/deviceid/requestdata', JSON.stringify({ getOnDemandData: 'requesting from web' }));
    });


device
    .on('message', (topic, payload) => {
        console.log('message', topic, payload.toString());
    });

device
    .on('error', function (topic, payload) {
        console.log('Error:', topic, payload.toString());
    });