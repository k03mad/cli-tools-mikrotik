#!/usr/bin/env node

import {mikrotik, print} from '@k03mad/util';
import chalk from 'chalk';

import env from '../env.js';
import log from '../log.js';

const {blue, cyan, green, magenta, yellow} = chalk;

const servers = {
    adguard: env.adg.doh,
    cloudflare: 'https://dns.cloudflare.com/dns-query',
    google: 'https://dns.google/dns-query',
};

const flushArg = 'flush';
const providerArg = 'provider';

(async () => {
    try {
        const [arg] = env.args;
        const server = servers[arg];

        if (arg === providerArg) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': ''}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'no'}),
            ]);

            log(`DNS: ${blue(providerArg)}`);

        } else if (server) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': server}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'yes'}),
            ]);

            log(`DNS: ${blue(server)}`);

        } else if (arg !== flushArg) {
            log(`Args: ${green(Object.keys(servers).join(', '))}, ${cyan(providerArg)}, ${magenta(flushArg)}`);
            return;
        }

        await mikrotik.post('/ip/dns/cache/flush');
        log(yellow('Cache flushed'));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
