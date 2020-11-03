#!/usr/bin/env node

'use strict';

const table = require('text-table');
const {arg} = require('../env');
const {green, blue, yellow, magenta} = require('chalk');
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

            elem.comment.includes(arg) && rules.push(elem);
        });

        if (rules.length > 0) {
            const ids = rules.map(elem => elem['.id']);

            status = rules[0].disabled === 'false' ? 'disable' : 'enable';
            await mikrotik.write([...ids.map(id => [`${MIKROTIK_INTERFACE}/${status}`, `=.id=${id}`])]);
        } else {
            rules = nat;
            console.log(
                `${yellow('Add rule name after command')}\n`
                + `Rules to switch will be found with ${green('.includes(name)')} by rule comment\n`,
            );
        }

        console.log(`${blue('Rules:')} ${status ? magenta(`${status}d`) : ''}\n`);
        console.log(table(rules.map(elem => [elem.action, elem.comment, status ? '' : `disabled: ${elem.disabled}`])));
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
