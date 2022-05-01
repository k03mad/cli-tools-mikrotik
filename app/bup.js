#!/usr/bin/env node

import {mikrotik, print} from '@k03mad/util';

import log from '../log.js';

(async () => {
    try {
        log('Backup script started...');
        const scripts = await mikrotik.post('/system/script/print');
        const backup = scripts.find(elem => elem.name === 'backup');

        try {
            await mikrotik.post('/system/script/run', {
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
