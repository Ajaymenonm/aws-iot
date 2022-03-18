const AwsIotModule = require('./awsiot')
const awsIot = new AwsIotModule()


awsIot.init()


const onDemandRes = (payload) => {
    console.log('Received on-demand data')
    const parsedlevel = levelParser(payload.level)
    console.log(`temp: ${payload.temp}C, humidity: ${payload.humidity}RH, level: ${payload.level}cm - ${parsedlevel} \n`)
}

const alerts = (payload) => {

    if ('level' in payload) {
        console.log(`**level alert received**`)
        const parsedlevel = levelParser(payload.level)
        console.log(`sauce level is at ${parsedlevel}. device: ${payload.deviceId}\n`)
    }

    if ('temp' in payload) {
        console.log(`**temperature alert received**`)
        console.log(`temperature is ${payload.temp}cm. device: ${payload.deviceId}\n`)
    }
}

const levelParser = (level) => {
    if (level <= 5) return "Full"
    if (level > 5 && level < 12) return "Half"
    if (level > 12 && level < 15) return "Low"
    else return level
}

const onDemandReq = () => {
    awsIot.publishMessage('store/ondemand/deviceid/req', JSON.stringify({ requestType: 'ondemand' }))
}

const main = () => {
    console.log('...server running')
}


module.exports.onDemandRes = onDemandRes
module.exports.alerts = alerts

setInterval(() => main(), 500000)
setInterval(() => onDemandReq(), 10000)