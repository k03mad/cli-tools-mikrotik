#!/usr/bin/env node

import utils from '@k03mad/utils';

const {mikrotik, print} = utils;

(async () => {
    try {
        const scripts = await mikrotik.write('/system/script/print');
        console.log('Backup script started...');

        const backup = scripts.find(elem => elem.name === 'backup');
        await mikrotik.write(['/system/script/run', `=.id=${backup['.id']}`]);

        console.log('Backup script finished');
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
