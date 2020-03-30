'use strict';

const {green, blue, yellow, cyan, magenta} = require('colorette');

module.exports = {

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

    ip: (parsedList, countriesBlacklist, filteredCountries) => {
        console.log(`\nParsed IPs: ${parsedList.length}`);
        console.log(`After countries filter (${countriesBlacklist}): ${filteredCountries.length}`);
    },

    server: (before, comment) => {
        console.log(cyan(`\nCurrent PPTP Server: ${before.comment}`));
        console.log(`${blue(before['connect-to'])}: running ${before.running}`);
        console.log(magenta(`\nNew PPTP Server: ${comment}`));
    },

    connect: after => {
        console.log(`${blue(after['connect-to'])}: running ${after.running}`);
    },
};
