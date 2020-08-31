'use strict';

const table = require('text-table');
const {green, blue, yellow, cyan, magenta} = require('chalk');

module.exports = {
    /* eslint-disable jsdoc/require-jsdoc */

    countries: list => {
        const output = [];
        let country;

        list.forEach(elem => {
            if (country !== elem.country) {
                output.push([`\n${yellow(elem.country)}`]);
            }

            output.push([green(elem.city), blue(elem.ip)]);
            ({country} = elem);
        });

        console.log(table(output));
    },

    ip: (parsedList, countriesBlacklist, ipBlacklist, filtered) => {
        console.log(`\nServers count: ${parsedList.length}`);
        console.log(`\nFilter countries: ${[...countriesBlacklist].join(', ') || '—'}`);
        console.log(`Filter ips: ${[...ipBlacklist].join(', ') || '—'}`);
        console.log(`\nServers count after filtering: ${filtered.length}`);
    },

    server: (before, comment) => {
        console.log(cyan(`\nCurrent PPTP Server: ${before.comment}`));
        console.log(`${blue(before['connect-to'])}: running ${before.running}`);
        console.log(magenta(`\nNew PPTP Server: ${comment}`));
    },

    connect: after => {
        console.log(`${blue(after['connect-to'])}: running ${after.running}`);
    },

    pings: list => {
        console.log('Choosing from fastest servers:\n');
        console.log(table([
            ['', '', '', 'ping'],
            ...list.map(elem => Object.values(elem)),
        ]));
    },

    dns: (serverName, serverIp) => {
        console.log(`${yellow('DNS:')} ${green(serverName)}\n`);
        console.log(table([[...new Set(serverIp.split(','))]]));
    },

    nat: (rules, status) => {
        status && console.log(`${yellow('Pi NAT rules')} ${magenta(`${status}d`)}\n`);
        console.log(table(rules.map(elem => elem.comment ? elem.comment.split(' :: ') : '').filter(Boolean)));
    },
};
