const zlib = require('zlib');
const util = require('util');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const unzipAsync = util.promisify(zlib.brotliDecompress);

/**
 * Decompress telemetry and dump to S3
 * @param {object} event Telemetry object from aws iot rule
 * @return {boolean} 
 */
exports.handler = async (event) => {
    const payload = event;
    console.log('Received event:', event);

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
            console.log(`Decompression Successful`);
            return decompressedmessage
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
            Body: decompressedtelemetry,
            ContentType: 'application/json; charset=utf-8'
        }
        await S3.putObject(params).promise();
        console.log("Upload to S3 Completed");
    } catch (err) {
        console.log(`error uploading to s3 ${err}`);
    }
}