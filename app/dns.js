#!/usr/bin/env node

'use strict';

const {args, next} = require('../env');
const {green, blue, yellow, cyan, magenta} = require('colorette');
const {mikrotik, print, promise} = require('@k03mad/utils');

const servers = {
    nextdns: next.doh,
    adguard: 'https://dns.adguard.com/dns-query',
    google: 'https://dns.google/dns-query',
    cloudflare: 'https://dns.cloudflare.com/dns-query',
};

const ovpnDelay = 2000;
const flushArg = 'flush';
const providerArg = 'provider';

const resetOvpn = async () => {
    const interfaces = await mikrotik.write('/interface/ovpn-client/print');
    const ovpn = interfaces.find(elem => elem.name === 'ovpn1');

    if (ovpn.disabled === 'false') {
        await mikrotik.write(['/interface/ovpn-client/disable', `=.id=${ovpn['.id']}`]);
        await promise.delay(ovpnDelay);
        await mikrotik.write(['/interface/ovpn-client/enable', `=.id=${ovpn['.id']}`]);
        await promise.delay(ovpnDelay);

        const scripts = await mikrotik.write('/system/script/print');
        const rkn = scripts.find(elem => elem.name === 'set static dns for rkn');
        await mikrotik.write(['/system/script/run', `=.id=${rkn['.id']}`]);
    }
};

(async () => {
    try {
        const [arg] = args;
        const server = servers[arg];

        if (arg === providerArg) {
            await mikrotik.write([
                ['/ip/dns/set', '=use-doh-server='],
                ['/ip/dns/set', '=verify-doh-cert=no'],
            ]);

            await resetOvpn();
            console.log(`DNS: ${blue(providerArg)}`);

        } else if (server) {
            await mikrotik.write([
                ['/ip/dns/set', `=use-doh-server=${server}`],
                ['/ip/dns/set', '=verify-doh-cert=yes'],
            ]);

            await resetOvpn();
            console.log(`DNS: ${blue(server)}`);

        } else if (arg !== flushArg) {
            console.log(`Args: ${green(Object.keys(servers).join(', '))}, ${magenta(flushArg)}, ${cyan(providerArg)}`);
            return;
        }

        await mikrotik.write('/ip/dns/cache/flush');
        console.log(yellow('Cache flushed'));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
