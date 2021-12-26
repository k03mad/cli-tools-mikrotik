#!/usr/bin/env node

import {mikrotik, print, promise} from '@k03mad/util';
import chalk from 'chalk';

import env from '../env.js';

const {blue, cyan, green, magenta, yellow} = chalk;

const servers = {
    nextdns: env.next.doh,
    adguard: 'https://dns.adguard.com/dns-query',
    google: 'https://dns.google/dns-query',
    cloudflare: 'https://dns.cloudflare.com/dns-query',
};

const ovpnDelay = 2000;
const flushArg = 'flush';
const providerArg = 'provider';

const resetOvpn = async () => {
    const interfaces = await mikrotik.post('/interface/ovpn-client/print');
    const ovpn = interfaces.find(elem => elem.name === 'ovpn1');

    if (ovpn.disabled === 'false') {
        await mikrotik.post('/interface/ovpn-client/disable', {'.id': ovpn['.id']});
        await promise.delay(ovpnDelay);
        await mikrotik.post('/interface/ovpn-client/enable', {'.id': ovpn['.id']});
        await promise.delay(ovpnDelay);

        const scripts = await mikrotik.get('/system/script');
        const rkn = scripts.find(elem => elem.name === 'set static dns for rkn');
        await mikrotik.post('/system/script/run', {'.id': rkn['.id']});
    }
};

(async () => {
    try {
        const [arg] = env.args;
        const server = servers[arg];

        if (arg === providerArg) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': ''}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'no'}),
            ]);

            await resetOvpn();
            console.log(`DNS: ${blue(providerArg)}`);

        } else if (server) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': server}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'yes'}),
            ]);

            await resetOvpn();
            console.log(`DNS: ${blue(server)}`);

        } else if (arg !== flushArg) {
            console.log(`Args: ${green(Object.keys(servers).join(', '))}, ${magenta(flushArg)}, ${cyan(providerArg)}`);
            return;
        }

        await mikrotik.post('/ip/dns/cache/flush');
        console.log(yellow('Cache flushed'));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
