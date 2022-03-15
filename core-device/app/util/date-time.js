const moment = require('moment-timezone');

const timezone = moment.tz.guess();
const getHourForUTCDate = () => moment().tz(timezone).utc().format('YYYY_MM_DD_HH_mm');

module.exports = { getHourForUTCDate }