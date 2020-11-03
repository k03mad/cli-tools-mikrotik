#!/usr/bin/env node

'use strict';

const {mikrotik, print} = require('utils-mad');

(async () => {
    try {
        const scripts = await mikrotik.write('/system/script/print');
        console.log('Backup script started...');

        const backup = scripts.find(elem => elem.name === 'BackupAndUpdate');
        await mikrotik.write(['/system/script/run', `=.id=${backup['.id']}`]);

        console.log('Backup script finished');
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
