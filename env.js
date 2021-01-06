'use strict';

const {argv} = require('yargs');

const args = argv._;

module.exports = {
    args: args.length > 0 ? args : [],

    mikrotik: {
        host: process.env.MIKROTIK_HOST,
    },
    next: {
        doh: process.env.NEXT_DNS_DOH,
    },
};
