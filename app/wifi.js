#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {arg} = require('../env');
const {mikrotik, print} = require('utils-mad');

const WIFI_INTERFACE = 'wlan';

(async () => {
    try {
        let name, status;

        if (['2', '5'].includes(arg)) {
            name = WIFI_INTERFACE + arg;
            status = await mikrotik.switch('/interface', name);
        }

        log.wifi(name, status);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
