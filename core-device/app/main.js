const dhtsensor = require('node-dht-sensor').promises;


const readSensorData = async () => {
    try {
        // 22 -> dht22 sensor; 4 -> gpio pin
        const res = await dhtsensor.read(22, 4);
        let temp = res.temperature.toFixed(1);
        let humidity = res.humidity.toFixed(1);
        console.log(`Temp: ${temp}, Humidity: ${humidity}`)
    } catch (err) {
        console.error(`error reading sensor data: ${err}`)
    }
}

async function main() {
    logger.info(`********************Starting Core Device App********************`)
    readSensorData()
}

main().catch(console.error)