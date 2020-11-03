#!/usr/bin/env node

'use strict';

const pMap = require('p-map');
const sort = require('./utils/sort');
const table = require('text-table');
const {arg} = require('../env');
const {array, request, mikrotik, promise, print, string} = require('utils-mad');
const {green, blue, yellow, cyan, magenta} = require('chalk');
const {hidemy: {code}} = require('../env');
const {promise: ping} = require('ping');

const API_URL = 'https://hidemy.name/api/pptp.php';

const VPN_LIST_NEWLINE = /\r\n/;
const VPN_LIST_SEPARATOR = / - |, /g;

const VPN_CONNECTION_RETRIES = 5;
const PING_CONCURRENCY = 5;
const CHOOSE_FROM_FASTEST = 30;

const MIKROTIK_INTERFACE = '/interface/pptp-client';

const countriesBlacklist = new Set(['Russia', 'Ukraine']);

(async () => {
    try {
        const {body} = await request.cache(API_URL, {
            searchParams: {serverlist: '', code},
        }, {expire: '1d'});

        const parsedList = body
            .split(VPN_LIST_NEWLINE)
            .filter(Boolean)
            .map(entry => {
                const [ip, country, city] = entry.split(VPN_LIST_SEPARATOR);
                return {ip, country, city};
            })
            .sort(sort.country);

        const output = [];
        let country;

        parsedList.forEach(elem => {
            if (country !== elem.country) {
                output.push([`\n${yellow(elem.country)}`]);
            }

            output.push([green(elem.city), blue(elem.ip)]);
            ({country} = elem);
        });

        console.log(table(output));

        const filtered = parsedList.filter(elem => arg
            ? elem.country === string.firstUpper(arg)
            : !countriesBlacklist.has(elem.country),
        );

        console.log(`\nServers count: ${parsedList.length}`);
        console.log(arg ? `\nChoosing country from arg: ${arg}` : `\nFilter countries: ${[...countriesBlacklist].join(', ') || '—'}`);
        console.log(`\nServers count after filtering: ${filtered.length}`);

        const servers = await pMap(filtered, async server => {
            const {time} = await ping.probe(server.ip);
            return {...server, ping: time};
        }, {concurrency: PING_CONCURRENCY});

        const fastest = servers.sort(sort.ping).slice(0, CHOOSE_FROM_FASTEST);

        console.log('Choosing from fastest servers:\n');
        console.log(table([
            ['', '', '', 'ping'],
            ...fastest.map(elem => Object.values(elem)),
        ]));

        for (const choosenServer of array.shuffle(fastest)) {
            const comment = `${choosenServer.country} :: ${choosenServer.city} :: ${choosenServer.ping}ms`;

            const [before] = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);

            if (before['connect-to'] !== choosenServer.ip) {
                console.log(cyan(`\nCurrent PPTP Server: ${before.comment}`));
                console.log(`${blue(before['connect-to'])}: running ${before.running}`);
                console.log(magenta(`\nNew PPTP Server: ${comment}`));

                await mikrotik.write([
                    [`${MIKROTIK_INTERFACE}/set`, `=.id=${before['.id']}`, `=connect-to=${choosenServer.ip}`],
                    [`${MIKROTIK_INTERFACE}/set`, `=.id=${before['.id']}`, `=comment=${comment}`],
                ]);

                let found;

                for (let i = 0; i < VPN_CONNECTION_RETRIES; i++) {
                    await promise.delay();

                    const [after] = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
                    console.log(`${blue(after['connect-to'])}: running ${after.running}`);

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
