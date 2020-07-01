#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {mikrotik, print} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/firewall/nat';

(async () => {
    try {
        const nat = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
        const pi = nat.filter(elem => !elem.comment || elem.comment.startsWith('pi'));
        const ids = pi.map(elem => elem['.id']);

        const status = pi[0].disabled === 'false' ? 'disable' : 'enable';
        await mikrotik.write([...ids.map(id => [`${MIKROTIK_INTERFACE}/${status}`, `=.id=${id}`])]);

        log.nat(status);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
