#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {arg} = require('../env');
const {mikrotik, print} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/firewall/nat';

(async () => {
    try {
        const nat = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
        const rules = [];

        let lastComment;
        nat.forEach(elem => {
            elem.comment
                ? lastComment = elem.comment
                : elem.comment = lastComment;

            elem.comment.includes(arg) && rules.push(elem);
        });

        if (rules.length > 0) {
            const ids = rules.map(elem => elem['.id']);

            const status = rules[0].disabled === 'false' ? 'disable' : 'enable';
            await mikrotik.write([...ids.map(id => [`${MIKROTIK_INTERFACE}/${status}`, `=.id=${id}`])]);

            log.nat(rules, status);
        } else {
            log.arg();
            log.nat(nat);
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
