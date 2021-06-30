#!/usr/bin/env node

'use strict';

const {args, next} = require('../env');
const {green, blue, yellow, cyan, magenta} = require('chalk');
const {mikrotik, print} = require('@k03mad/utils');

const servers = {
    nextdns: next.doh,
    adguard: 'https://dns.adguard.com/dns-query',
    google: 'https://dns.google/dns-query',
    cloudflare: 'https://dns.cloudflare.com/dns-query',
};

const flushArg = 'flush';
const providerArg = 'provider';

const switchPeerDns = async bool => {
    const dhcpClients = await mikrotik.write('/ip/dhcp-client/print');
    await mikrotik.write(
        dhcpClients.map(elem => ['/ip/dhcp-client/set', `=.id=${elem['.id']}`, `=use-peer-dns=${bool}`]),
    );
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

            await switchPeerDns(true);
            console.log(`DNS: ${blue(providerArg)}`);

        } else if (server) {
            await mikrotik.write([
                ['/ip/dns/set', `=use-doh-server=${server}`],
                ['/ip/dns/set', '=verify-doh-cert=yes'],
            ]);

            await switchPeerDns(false);
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
