#!/usr/bin/env node

'use strict';

const log = require('./utils/log');
const {arg} = require('../env');
const {mikrotik, print} = require('utils-mad');

const MIKROTIK_INTERFACE = '/ip/firewall/nat';
const DEF_CONF = 'defconf';

(async () => {
    try {
        const nat = await mikrotik.write(`${MIKROTIK_INTERFACE}/print`);
        const rules = nat.filter(elem => !elem.comment.startsWith(DEF_CONF) && elem.comment.includes(arg));

        if (rules.length === 0) {
            const withoutArg = nat.filter(elem => !elem.comment.startsWith(DEF_CONF));

            log.arg();
            log.nat(withoutArg);
        } else {
            const ids = rules.map(elem => elem['.id']);

            const status = rules[0].disabled === 'false' ? 'disable' : 'enable';
            await mikrotik.write([...ids.map(id => [`${MIKROTIK_INTERFACE}/${status}`, `=.id=${id}`])]);

            log.nat(rules, status);
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
