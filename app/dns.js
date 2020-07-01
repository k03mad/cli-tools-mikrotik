#!/usr/bin/env node

'use strict';

const env = require('../env');
const log = require('./utils/log');
const {array, mikrotik, print} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/dhcp-server/network';
const MIKROTIK_NETWORK_ID = 1;

(async () => {
    try {
        const servers = [

            env.mikrotik.host,
            env.pi.host,
            '1.1.1.1, 8.8.8.8, 9.9.9.9',

        ].map(elem => elem.includes(',')
            ? elem.replace(/\s+/g, '')
            : `${elem},`.repeat(3).slice(0, -1),
        );

        const dhcp = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
        const nextServer = array.next(servers, dhcp[MIKROTIK_NETWORK_ID - 1]['dns-server']);

        await mikrotik.write([
            `${MIKROTIK_INTERFACE}/set`,
            `=.id=*${MIKROTIK_NETWORK_ID}`,
            `=dns-server=${nextServer}`,
        ]);

        log.dns(nextServer);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
