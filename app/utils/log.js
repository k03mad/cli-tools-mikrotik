'use strict';

const asTable = require('as-table');
const {green, blue, yellow, cyan, magenta} = require('chalk');

module.exports = {
    /* eslint-disable jsdoc/require-jsdoc */

    countries: list => {
        let country;

        list.forEach(elem => {
            if (country !== elem.country) {
                console.log(`\n${yellow(elem.country)}`);
            }

            console.log(`${green(elem.city)}: ${blue(elem.ip)}`);
            ({country} = elem);
        });
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
        console.log(asTable(list));
    },

    dns: (serverName, serverIp) => {
        console.log(`${yellow('DNS:')} ${green(serverName)}\n`);
        console.log(asTable([[...new Set(serverIp.split(','))]]));
    },

    nat: (status, rules) => {
        console.log(`${yellow('Pi NAT rules')} ${magenta(`${status}d`)}\n`);
        console.log(asTable(rules.map(elem => elem.comment ? elem.comment.split(' :: ') : '').filter(Boolean)));
    },
};
