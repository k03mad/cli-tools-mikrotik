'use strict';

const {argv: {_: [arg]}} = require('yargs');

module.exports = {
    arg,
    hidemy: {
        code: process.env.HIDEMY_CODE,
    },
    mikrotik: {
        host: process.env.MIKROTIK_HOST,
    },
    pi: {
        host: process.env.PI_HOST,
    },
};
