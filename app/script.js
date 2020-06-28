#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const pMap = require('p-map');
const sort = require('./utils/sort');
const {array, request, mikrotik, promise, print} = require('utils-mad');
const {hidemy: {code}} = require('../env');
const {promise: ping} = require('ping');

const API_URL = 'https://hidemy.name/api/pptp.php';

const VPN_LIST_NEWLINE = /\r\n/;
const VPN_LIST_SEPARATOR = / - |, /g;

const VPN_CONNECTION_RETRIES = 3;
const PING_CONCURRENCY = 5;
const CHOOSE_FROM_FASTEST = 30;

const MIKROTIK_INTERFACE = '/interface/pptp-client';

const countriesBlacklist = new Set(['Russia', 'Ukraine']);
const ipBlacklist = new Set([]);

(async () => {
    try {

        const {body} = await request.cache(API_URL, {searchParams: {serverlist: '', code}}, {diff: 1});

        const parsedList = body
            .split(VPN_LIST_NEWLINE)
            .filter(Boolean)
            .map(entry => {
                const [ip, country, city] = entry.split(VPN_LIST_SEPARATOR);
                return {ip, country, city};
            })
            .sort(sort.country);

        log.countries(parsedList);

        const filtered = parsedList
            .filter(elem => !countriesBlacklist.has(elem.country))
            .filter(elem => !ipBlacklist.has(elem.ip));

        log.ip(parsedList, countriesBlacklist, ipBlacklist, filtered);

        const servers = await pMap(filtered, async server => {
            const {time} = await ping.probe(server.ip);
            return {...server, ping: time};
        }, {concurrency: PING_CONCURRENCY});

        const fastest = servers.sort(sort.ping).slice(0, CHOOSE_FROM_FASTEST);
        log.pings(fastest);

        for (const choosenServer of array.shuffle(fastest)) {
            const comment = `${choosenServer.country}/${choosenServer.city}/${choosenServer.ping}ms`;

            const [before] = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);

            if (before['connect-to'] !== choosenServer.ip) {
                log.server(before, comment);

                await mikrotik.write([
                    [`${MIKROTIK_INTERFACE}/set`, `=.id=${before['.id']}`, `=connect-to=${choosenServer.ip}`],
                    [`${MIKROTIK_INTERFACE}/set`, `=.id=${before['.id']}`, `=comment=${comment}`],
                ]);

                let found;

                for (let i = 0; i < VPN_CONNECTION_RETRIES; i++) {
                    await promise.delay();

                    const [after] = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
                    log.connect(after);

                    if (after.running === 'true') {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    break;
                }
            }
        }

    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
