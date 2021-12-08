#!/usr/bin/env node

import utils from '@k03mad/util';

const {mikrotik, print} = utils;

(async () => {
    try {
        console.log('Backup script started...');
        const scripts = await mikrotik.get('system/script');
        console.log(`Found ${scripts.length} scripts`);

        const backup = scripts.find(elem => elem.name === 'backup');
        console.log('Started backup script');

        try {
            await mikrotik.post('system/script/run', {
                '.id': backup['.id'],
            }, {timeout: {request: 3000}});
        } catch (err) {
            if (!err.message.includes('Timeout')) {
                throw err;
            }
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
