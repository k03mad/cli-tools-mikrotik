#!/usr/bin/env node

'use strict';

const {arg, next} = require('../env');
const {green, blue, yellow, cyan, magenta} = require('chalk');
const {mikrotik, print} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/dns';

const servers = {
    next: next.doh,
    adg: 'https://dns.adguard.com/dns-query',
    google: 'https://dns.google/dns-query',
    cloudflare: 'https://dns.cloudflare.com/dns-query',
};

const flushArg = 'flush';
const providerArg = 'provider';

(async () => {
    try {
        const server = servers[arg];
        const flush = arg === flushArg;
        const provider = arg === providerArg;

        if (provider) {
            await mikrotik.write([
                [`${MIKROTIK_INTERFACE}/set`, '=use-doh-server='],
                [`${MIKROTIK_INTERFACE}/set`, '=verify-doh-cert=no'],
            ]);
            console.log(`DNS: ${blue('provider')}`);

        } else if (server) {
            await mikrotik.write([
                [`${MIKROTIK_INTERFACE}/set`, `=use-doh-server=${server}`],
                [`${MIKROTIK_INTERFACE}/set`, '=verify-doh-cert=yes'],
            ]);
            console.log(`DNS: ${blue(server)}`);

        } else if (!flush) {
            console.log(`Args: ${green(Object.keys(servers).join(', '))}, ${magenta(flushArg)}, ${cyan(providerArg)}`);
            return;
        }

        await mikrotik.write(`${MIKROTIK_INTERFACE}/cache/flush`);
        console.log(yellow('Cache flushed'));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
