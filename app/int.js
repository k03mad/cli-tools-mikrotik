#!/usr/bin/env node

import env from '../env.js';
import utils from '@k03mad/utils';
import {blue, dim, green, magenta} from 'colorette';

const {mikrotik, print} = utils;

(async () => {
    try {
        const [arg] = env.args;

        if (arg) {
            const status = await mikrotik.switch('/interface', arg);
            console.log(`${blue(`${arg}:`)} ${magenta(status)}`);
        } else {
            const interfaces = await mikrotik.write(['/interface/print']);
            const names = interfaces
                .map(elem => `${elem.name} ${elem.disabled === 'true' ? dim('disabled') : ''}`.trim())
                .join('\n');

            console.log(
                `Pass interface name as arg for enable/disable\n\n${blue('Interfaces:')}\n\n${green(names)}`,
            );
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
