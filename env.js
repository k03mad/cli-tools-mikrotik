'use strict';

const {argv: {_: [arg]}} = require('yargs');

module.exports = {
    arg: arg ? String(arg).trim() : arg,

    hidemy: {
        code: process.env.HIDEMY_CODE,
    },
    mikrotik: {
        host: process.env.MIKROTIK_HOST,
    },
    next: {
        doh: process.env.NEXT_DNS_DOH,
    },
};
