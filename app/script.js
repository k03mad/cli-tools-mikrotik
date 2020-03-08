'use strict';

const {green, blue, yellow, magenta, cyan} = require('colorette');
const {hidemy: {code}} = require('../env');
const {request, array, mikrotik, promise, print} = require('utils-mad');

const API_URL = 'https://hidemy.name/api/pptp.php';

const VPN_CONNECT_RETRIES = 5;

const VPN_LIST_NEWLINE = /\r\n/;
const VPN_LIST_SEPARATOR = / - |, /g;

const chooseFromCountries = [
    'Czech Republic',
    'Estonia',
    'Finland',
    'Germany',
    'Hungary',
    'Latvia',
    'Lithuania',
    'Poland',
    'Romania',
    'Serbia',
    'Slovenia',
];

(async () => {
    try {

        const {body} = await request.got(API_URL, {searchParams: {serverlist: '', code}});

        const parsedList = body
            .split(VPN_LIST_NEWLINE)
            .filter(Boolean)
            .map(entry => {
                const [ip, country, city] = entry.split(VPN_LIST_SEPARATOR);
                return {ip, country, city};
            })
            .sort((a, b) => {
                if (a.country < b.country) {
                    return -1;
                }

                if (a.country > b.country) {
                    return 1;
                }

                return 0;
            });

        let country;
        parsedList.forEach(elem => {
            if (country !== elem.country) {
                console.log(`\n${yellow(elem.country)}`);
            }

            console.log(`${green(elem.city)}: ${blue(elem.ip)}`);
            ({country} = elem);
        });

        const filteredCountries = parsedList.filter(elem => chooseFromCountries.includes(elem.country));
        console.log(`\nParsed IPs: ${parsedList.length}`);
        console.log(`Filtered by countries: ${filteredCountries.length}`);

        for (const choosenServer of array.shuffle(filteredCountries)) {
            const comment = `${choosenServer.country}/${choosenServer.city}`;

            const [before] = await mikrotik.write('/interface/pptp-client/print');
            console.log(cyan(`\nCurrent PPTP Server: ${before.comment}`));
            console.log(`${blue(before['connect-to'])}: running ${before.running}`);

            await mikrotik.write([
                ['/interface/pptp-client/set', `=.id=${before['.id']}`, `=connect-to=${choosenServer.ip}`],
                ['/interface/pptp-client/set', `=.id=${before['.id']}`, `=comment=${comment}`],
            ]);
            console.log(magenta(`\nNew PPTP Server: ${comment}`));

            let found;

            for (let i = 0; i < VPN_CONNECT_RETRIES; i++) {
                await promise.delay();

                const [after] = await mikrotik.write('/interface/pptp-client/print');
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

    } catch (err) {
        print(err, {full: true, exit: true});
    }
})();
