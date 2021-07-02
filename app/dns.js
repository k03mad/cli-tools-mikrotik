#!/usr/bin/env node

'use strict';

const {args, next} = require('../env');
const {green, blue, yellow, cyan, magenta} = require('chalk');
const {mikrotik, print, promise} = require('@k03mad/utils');

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

const resetOvpn = async () => {
    const interfaces = await mikrotik.write('/interface/ovpn-client/print');
    const ovpn = interfaces.find(elem => elem.name === 'ovpn1');

    if (ovpn.disabled === 'false') {
        await mikrotik.write(['/interface/ovpn-client/disable', `=.id=${ovpn['.id']}`]);
        await promise.delay();
        await mikrotik.write(['/interface/ovpn-client/enable', `=.id=${ovpn['.id']}`]);
    }
};

(async () => {
    try {
        const [arg] = args;
        const server = servers[arg];

        if (arg === providerArg) {
            await mikrotik.write([['/ip/dns/set', '=use-doh-server=']]);

            await switchPeerDns(true);
            await resetOvpn();
            console.log(`DNS: ${blue(providerArg)}`);

        } else if (server) {
            await mikrotik.write([['/ip/dns/set', `=use-doh-server=${server}`]]);

            await switchPeerDns(false);
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
