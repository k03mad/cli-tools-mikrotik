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
    nextdns: {
        hosts: process.env.NEXTDNS_HOSTS.split(','),
    },
};
