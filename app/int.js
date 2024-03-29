#!/usr/bin/env node

import {mikrotik, print} from '@k03mad/util';
import chalk from 'chalk';

import env from '../env.js';
import log from '../log.js';

const {blue, dim, green, magenta} = chalk;

(async () => {
    try {
        const [arg] = env.args;
        const interfaces = await mikrotik.post('/interface/print');

        if (arg) {
            const rule = interfaces.find(elem => elem.name === arg);
            const status = rule.disabled === 'false' ? 'disable' : 'enable';

            await mikrotik.post(`/interface/${status}`, {'.id': rule['.id']});
            log(`${blue(`${arg}:`)} ${magenta(`${status}d`)}`);
        } else {
            const names = interfaces
                .map(elem => `${elem.name} ${elem.disabled === 'true' ? dim('disabled') : ''}`.trim())
                .join('\n');

            log(`Pass interface name as arg for enable/disable\n\n${blue('Interfaces:')}\n\n${green(names)}`);
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
