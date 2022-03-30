#!/usr/bin/env node

import {mikrotik, print} from '@k03mad/util';
import chalk from 'chalk';

import env from '../env.js';

const {blue, cyan, green, magenta, yellow} = chalk;

const servers = {
    adguard: 'https://dns.adguard.com/dns-query',
    google: 'https://dns.google/dns-query',
    cloudflare: 'https://dns.cloudflare.com/dns-query',
};

const flushArg = 'flush';
const providerArg = 'provider';
const ovpnArg = 'ovpn1';

const switchOvpn = async status => {
    const interfaces = await mikrotik.post('/interface/print');
    const ovpn = interfaces.find(elem => elem.name === ovpnArg);
    await mikrotik.post(`/interface/${status}`, {'.id': ovpn['.id']});
};

(async () => {
    try {
        const [arg] = env.args;
        const server = servers[arg];

        if (arg === providerArg) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': ''}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'no'}),
                switchOvpn('disable'),
            ]);

            console.log(`DNS: ${blue(providerArg)}`);

        } else if (server) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': server}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'yes'}),
                switchOvpn('disable'),
            ]);

            console.log(`DNS: ${blue(server)}`);

        } else if (arg === ovpnArg) {
            await Promise.all([
                mikrotik.post('/ip/dns/set', {'use-doh-server': ''}),
                mikrotik.post('/ip/dns/set', {'verify-doh-cert': 'no'}),
                switchOvpn('enable'),
            ]);

            console.log(`DNS: ${blue(ovpnArg)}`);

        } else if (arg !== flushArg) {
            console.log(`Args: ${green(Object.keys(servers).join(', '))}, ${cyan(ovpnArg)}, ${cyan(providerArg)}, ${magenta(flushArg)}`);
            return;
        }

        await mikrotik.post('/ip/dns/cache/flush');
        console.log(yellow('Cache flushed'));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
