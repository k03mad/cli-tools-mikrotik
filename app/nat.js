#!/usr/bin/env node

'use strict';

const table = require('text-table');
const {args} = require('../env');
const {green, blue, yellow, magenta, dim} = require('chalk');
const {mikrotik, print} = require('@k03mad/utils');

(async () => {
    try {
        const nat = await mikrotik.write('/ip/firewall/nat/print');
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
            await mikrotik.write([...ids.map(id => [`/ip/firewall/nat/${status}`, `=.id=${id}`])]);
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
