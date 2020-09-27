'use strict';

const {argv: {_: [arg]}} = require('yargs');

module.exports = {
    arg: arg ? String(arg).trim() : arg,

    hidemy: {
        code: process.env.HIDEMY_CODE,
    },
    mikrotik: {
        host: process.env.MIKROTIK_HOST,
        station: {
            ssid: process.env.MIKROTIK_STATION_SSID,
        },
        wifi2: {
            ssid: process.env.MIKROTIK_WIFI2_SSID,
        },
    },
    pi: {
        host: process.env.PI_HOST,
    },
};
// TRENDnet651;
