#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {arg} = require('../env');
const {mikrotik, print} = require('utils-mad');

(async () => {
    try {
        let names, status;

        if (arg) {
            status = await mikrotik.switch('/interface', arg);
        } else {
            const interfaces = await mikrotik.write(['/interface/print']);
            names = interfaces.map(elem => elem.name).join(', ');
        }

        log.int(arg, status, names);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
