#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {arg} = require('../env');
const {mikrotik, print} = require('utils-mad');

(async () => {
    try {
        let status;

        if (arg) {
            status = await mikrotik.switch('/interface', arg);
        }

        log.int(arg, status);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
