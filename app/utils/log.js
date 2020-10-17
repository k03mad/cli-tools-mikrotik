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

    ip: (parsedList, countriesBlacklist, filtered, arg) => {
        console.log(`\nServers count: ${parsedList.length}`);
        console.log(arg ? `\nChoosing country from arg: ${arg}` : `\nFilter countries: ${[...countriesBlacklist].join(', ') || '—'}`);
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
        console.log(`${blue('Rules:')} ${status ? magenta(`${status}d`) : ''}\n`);
        console.log(table(rules.map(elem => [elem.action, elem.comment, status ? '' : `disabled: ${elem.disabled}`])));
    },

    arg: () => {
        console.log(`${yellow('Add rule name after command')}\nRules to switch will be found with ${green('.includes(name)')} by rule comment\n`);
    },

    int: (arg, status, names) => {
        console.log(arg
            ? `${blue(`${arg}:`)} ${magenta(status)}`
            : yellow(`Add interface name after command, available:\n${green(names)}`),
        );
    },

    station: spot => {
        console.log(Array.isArray(spot)
            ? `Turn off station and ${green('return WiFi 2.4')}\n\nAvailable spots:\n${spot.map((elem, i) => `${++i}. ${elem.name}`).join('\n')}`
            : `Turn on and switch station to: ${magenta(spot.name)}`,
        );
    },

    bup: done => {
        console.log(done
            ? 'Backup script finished'
            : 'Backup script started...',
        );
    },
};
