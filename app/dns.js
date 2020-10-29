#!/usr/bin/env node

'use strict';

const env = require('../env');
const log = require('./utils/log');
const {array, mikrotik, print, object} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/dhcp-server/network';
const MIKROTIK_NETWORK_ID = 1;
const MIKROTIK_DNS_SERVERS_COUNT = 3;

const servers = {
    mikrotik: env.mikrotik.host,
    adguard: ['94.140.14.14', '94.140.15.15'],
    cloudflare: ['1.1.1.1', '1.0.0.1'],
    google: ['8.8.8.8', '8.8.4.4'],
};

(async () => {
    try {
        const prepareServers = {};

        Object.entries(servers).forEach(([key, value]) => {
            const ips = array.convert(value);

            for (let i = ips.length; i < MIKROTIK_DNS_SERVERS_COUNT; i++) {
                ips.push(ips[0]);
            }

            prepareServers[key] = ips.join(',');
        });

        const dhcp = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
        const nextServer = array.next(
            Object.values(prepareServers),
            dhcp[MIKROTIK_NETWORK_ID - 1]['dns-server'],
        );

        const serverName = object.reverse(prepareServers)[nextServer];
        const serverNameType = nextServer.startsWith('192')
            ? `local :: ${serverName}`
            : `global :: ${serverName}`;

        await mikrotik.write([
            [`${MIKROTIK_INTERFACE}/set`, `=.id=*${MIKROTIK_NETWORK_ID}`, `=dns-server=${nextServer}`],
            [`${MIKROTIK_INTERFACE}/set`, `=.id=*${MIKROTIK_NETWORK_ID}`, `=comment=DNS :: ${serverNameType}`],
        ]);

        log.dns(serverNameType, nextServer);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
