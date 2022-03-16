const zlib = require('zlib');
const util = require('util');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const unzipAsync = util.promisify(zlib.brotliDecompress);


exports.handler = async (event) => {
    // const main = async (event) => {
    // console.log('Received event:', JSON.stringify(event, null, 2));
    // const payload = JSON.stringify(event, null, 2)
    let payload = event;
    console.log('Received event:', event);
    // const payload = {
    //     "compresseddata": "G9MAQJwHxi3zLjQImv5OiIVagWyvD4jbUl9+uOc3dEtX0CAI3mCx6JQIjE5ODgzfDvxTlGBGqUcmeYzlDAYGDqKVJzkFOq0mccB8e/WVn1bk2IelMMfIS6w98fFV3TWCyaLaygA=",
    //     "file": "2022_03_16_04_40_50.csv",
    //     "deviceId": "device1234"
    // }

    const encodedData = payload.compresseddata
    const decompressedtelemetry = await decompressMessage(encodedData);

    if (Object.keys(decompressedtelemetry).length > 0) {
        const filename = payload.file
        const deviceid = payload.deviceid
        await uploadToS3(deviceid, filename, decompressedtelemetry)
    }

    return true
}


const decompressMessage = async (encodedData) => {
    try {
        if (encodedData.length > 0) {
            const compresseddata = Buffer.from(encodedData, 'base64');
            const decompressedmessageraw = await unzipAsync(compresseddata);
            decompressedmessage = decompressedmessageraw.toString('utf8');
            console.log(`decompressed message: ${decompressedmessage}`);
            console.log(`decompression successful`);
            return decompressedmessagern
        }
    } catch (err) {
        console.error(`error decompressing message: ${err}`);
    }
}


const uploadToS3 = async (deviceid, filename, decompressedtelemetry) => {
    try {
        const params = {
            Bucket: 'all-device-telemetry',
            Key: `${deviceid}/${filename}`,
            Body: JSON.stringify(decompressedtelemetry),
            ContentType: 'application/json; charset=utf-8'
        }
        await S3.putObject(params).promise();
        console.log("Upload Completed");
    } catch (err) {
        console.log(`error uploading to s3 ${err}`);
    }
}

// main()