#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {mikrotik, print} = require('utils-mad');

(async () => {
    try {
        const scripts = await mikrotik.write('/system/script/print');
        const backup = scripts.find(elem => elem.name === 'BackupAndUpdate');

        await mikrotik.write(['/system/script/run', `=.id=${backup['.id']}`]);

        log.bup();
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
