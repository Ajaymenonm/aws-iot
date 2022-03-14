const dhtsensor = require('node-dht-sensor').promises;
const awsiot = require('aws-iot-device-sdk');


const device = awsiot.device({
    clientId: 'RPi-Core-Device',
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
        device.subscribe('deviceid/ondemanddata');
        device.publish('deviceid/ondemanddata', JSON.stringify({ test_data: 1 }));
    });


device
    .on('message', (topic, payload) => {
        console.log('message', topic, payload.toString());
    });


const readSensorData = async () => {
    try {
        // 22 -> dht22 sensor; 4 -> gpio pin
        // const res = await dhtsensor.read(22, 4);
        // let temp = res.temperature.toFixed(1);
        // let humidity = res.humidity.toFixed(1);
        // console.log(`Temp: ${temp}, Humidity: ${humidity}`)
        console.log(`Temp: 10, Humidity: 20`)
    } catch (err) {
        console.error(`error reading sensor data: ${err}`)
    }
}

async function main() {
    console.log(`********************Starting Core Device App********************`)

    // random upload time to avoid bandwidth spike
    // const interval = Math.floor(Math.random() * (5 - 1) + 1)
    setInterval(() => readSensorData(), 2000)

}

main().catch(console.error)