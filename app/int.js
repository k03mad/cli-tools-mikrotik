#!/usr/bin/env node

'use strict';

const {arg} = require('../env');
const {green, blue, yellow, magenta} = require('chalk');
const {mikrotik, print} = require('utils-mad');

(async () => {
    try {
        let names, status;

        if (arg) {
            status = await mikrotik.switch('/interface', arg);
            console.log(`${blue(`${arg}:`)} ${magenta(status)}`);
        } else {
            const interfaces = await mikrotik.write(['/interface/print']);
            names = interfaces.map(elem => elem.name).join(', ');
            console.log(yellow(`Args: ${green(names)}`));
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
