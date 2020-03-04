'use strict';

const {green, blue, yellow, magenta, cyan} = require('colorette');
const {hidemy: {code}} = require('../env');
const {request, array, mikrotik, promise} = require('utils-mad');

(async () => {

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

    const {body} = await request.got('https://hidemy.name/api/pptp.php', {
        searchParams: {serverlist: '', code},
    });

    const parsedList = body
        .split(/\r\n/)
        .filter(Boolean)
        .map(entry => {
            const [ip, country, city] = entry
                .split(/ - |, /g)
                .map(elem => elem.replace(/ [A-Z]\d+$/, ''));

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

    for (const choosenServer of array.shuffle(filteredCountries).slice(0, 5)) {
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

        for (let i = 0; i < 7; i++) {
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

})();
