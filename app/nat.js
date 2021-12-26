#!/usr/bin/env node

import {mikrotik, print} from '@k03mad/util';
import chalk from 'chalk';
import table from 'text-table';

import env from '../env.js';

const {blue, dim, green, magenta, yellow} = chalk;

(async () => {
    try {
        const nat = await mikrotik.post('/ip/firewall/nat/print');
        let rules = [];
        let lastComment, status;

        nat.forEach(elem => {
            elem.comment
                ? lastComment = elem.comment
                : elem.comment = lastComment;

            elem.comment.includes(env.args[0]) && rules.push(elem);
        });

        if (rules.length > 0) {
            const ids = rules.map(elem => elem['.id']);

            status = rules[0].disabled === 'false' ? 'disable' : 'enable';
            await Promise.all(ids.map(id => mikrotik.post(`/ip/firewall/nat/${status}`, {'.id': id})));
        } else {
            rules = nat;
            console.log('Pass rule comment as arg for enable/disable\n');
        }

        console.log(`${blue('Rules:')} ${status ? magenta(`${status}d`) : ''}\n`);
        console.log(table(rules.map(elem => [
            yellow(elem.action),
            green(elem.comment),
            elem.disabled === 'true' ? green(dim('disabled')) : '',
        ])));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
