const moment = require('moment-timezone');

const timezone = moment.tz.guess();
const getHourForUTCDate = () => moment().tz(timezone).utc().format('YYYY_MM_DD_HH_mm_ss');
const getUTCDateTime = () => moment().tz(timezone).utc().format('YYYYMMDDHHmmss');

module.exports = {
    getHourForUTCDate,
    getUTCDateTime
}