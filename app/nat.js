#!/usr/bin/env node

'use strict';

const table = require('text-table');
const {args} = require('../env');
const {green, blue, yellow, magenta, red} = require('chalk');
const {mikrotik, print} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/firewall/nat';

(async () => {
    try {
        const nat = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
        let rules = [];
        let lastComment, status;

        nat.forEach(elem => {
            elem.comment
                ? lastComment = elem.comment
                : elem.comment = lastComment;

            elem.comment.includes(args[0]) && rules.push(elem);
        });

        if (rules.length > 0) {
            const ids = rules.map(elem => elem['.id']);

            status = rules[0].disabled === 'false' ? 'disable' : 'enable';
            await mikrotik.write([...ids.map(id => [`${MIKROTIK_INTERFACE}/${status}`, `=.id=${id}`])]);
        } else {
            rules = nat;
            console.log('Pass rule name to enable/disable\n');
        }

        console.log(`${blue('Rules:')} ${status ? magenta(`${status}d`) : ''}\n`);
        console.log(table(rules.map(elem => [
            elem.action,
            yellow(elem.comment),
            status
                ? ''
                // eslint-disable-next-line unicorn/no-nested-ternary
                : elem.disabled === 'false'
                    ? green('enabled')
                    : red('disabled'),
        ])));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
