const zlib = require('zlib');

// encode the buffer in base 64. UTF8 will not work.

const compress = (data) => {
    return new Promise((resolve) => {
        zlib.brotliCompress(data, {
            params: {
                [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
            }
        }, (err, compresseddata) => {
            if (err) {
                console.error(`error while compressing data: [${data}]. hence returning uncompressed data`);
                resolve(data);
            } else {
                console.log(`data compressed successfully`);
                resolve(compresseddata.toString("base64"));
            }
        })
    })
}

module.exports = { compress }