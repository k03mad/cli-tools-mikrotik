'use strict';

const pkg = require('./package.json');
const updateNotifier = require('update-notifier');
const {argv} = require('yargs');

updateNotifier({pkg}).notify();

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
