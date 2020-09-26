#!/usr/bin/env node
/* eslint-disable sonarjs/no-duplicate-string */

'use strict';

const log = require('./utils/log');
const {mikrotik, print} = require('utils-mad');
const {mikrotik: {station, wifi2}} = require('../env');

/**
 * @param {Array} data
 * @param {string} name
 * @returns {object}
 */
const findRule = (data, name = 'station') => data.find(elem => elem.comment.includes(name));

/**
 * @param {Array} data
 * @param {string} name
 * @returns {object}
 */
const getIdString = (data, name) => `=.id=${findRule(data, name)['.id']}`;

(async () => {
    try {
        const [bridge, wifi, list, dhcp, nat] = await mikrotik.write([
            ['/interface/bridge/port/print'],
            ['/interface/wireless/print'],
            ['/interface/list/member/print'],
            ['/ip/dhcp-client/print'],
            ['/ip/firewall/nat/print'],
        ]);

        const natRulesIds = nat
            .filter(elem => elem.comment.startsWith('pi'))
            .map(elem => elem['.id']);

        const isStationEnabled = findRule(bridge).disabled === 'true';

        if (isStationEnabled) {
            await mikrotik.write([
                ['/interface/bridge/port/enable', getIdString(bridge)],
                ['/interface/wireless/set', getIdString(wifi), '=security-profile=default'],
                ['/interface/wireless/set', getIdString(wifi), '=mode=ap-bridge'],
                ['/interface/wireless/set', getIdString(wifi), `=ssid=${wifi2.ssid}`],
                ['/interface/list/member/disable', getIdString(list)],
                ['/ip/dhcp-client/disable', getIdString(dhcp)],
                ['/ip/dhcp-client/disable', getIdString(dhcp)],
                ...natRulesIds.map(id => ['/ip/firewall/nat/enable', `=.id=${id}`]),
            ]);
        } else {
            await mikrotik.write([
                ['/interface/bridge/port/disable', getIdString(bridge)],
                ['/interface/wireless/set', getIdString(wifi), '=security-profile=station'],
                ['/interface/wireless/set', getIdString(wifi), '=mode=station'],
                ['/interface/wireless/set', getIdString(wifi), `=ssid=${station.ssid}`],
                ['/interface/list/member/enable', getIdString(list)],
                ['/ip/dhcp-client/enable', getIdString(dhcp)],
                ...natRulesIds.map(id => ['/ip/firewall/nat/disable', `=.id=${id}`]),
            ]);
        }

        log.station(isStationEnabled);
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
