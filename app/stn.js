#!/usr/bin/env node
/* eslint-disable sonarjs/no-duplicate-string */

'use strict';

const log = require('./utils/log');
const {arg} = require('../env');
const {mikrotik, print} = require('utils-mad');
const {mikrotik: {station, wifi2}} = require('../env');

/**
 * @param {Array} data
 * @param {string} name
 * @param {string} key
 * @returns {object}
 */
const findRule = (data, name = 'station', key = 'comment') => data
    .find(elem => (elem[key] || '').includes(name));

/**
 * @param {Array} data
 * @param {string} name
 * @param {string} key
 * @returns {object}
 */
const getIdString = (data, name, key) => `=.id=${findRule(data, name, key)['.id']}`;

(async () => {
    try {
        const [bridge, wifi, list, dhcp, ether, profiles] = await mikrotik.write([
            ['/interface/bridge/port/print'],
            ['/interface/wireless/print'],
            ['/interface/list/member/print'],
            ['/ip/dhcp-client/print'],
            ['/interface/ethernet/print'],
            ['/interface/wireless/security-profiles/print'],
        ]);

        if (arg) {
            const spots = station
                .split(';')
                .map(elem => {
                    const [name, password, auth, ciphers] = elem.split(':');
                    return {name, password, auth, ciphers};
                });

            const spot = spots[Number(arg) - 1];

            if (!spot) {
                throw new Error(`No spot num ${arg}`);
            }

            await mikrotik.write([
                ['/ip/cloud/set', '=ddns-enabled=no'],

                ['/interface/wireless/security-profiles/set', getIdString(profiles, 'station', 'name'), `=authentication-types=${spot.auth}`],
                ['/interface/wireless/security-profiles/set', getIdString(profiles, 'station', 'name'), `=unicast-ciphers=${spot.ciphers}`],
                ['/interface/wireless/security-profiles/set', getIdString(profiles, 'station', 'name'), `=group-ciphers=${spot.ciphers}`],
                ['/interface/wireless/security-profiles/set', getIdString(profiles, 'station', 'name'), `=wpa-pre-shared-key=${spot.password}`],
                ['/interface/wireless/security-profiles/set', getIdString(profiles, 'station', 'name'), `=wpa2-pre-shared-key=${spot.password}`],

                ['/interface/wireless/set', getIdString(wifi), '=security-profile=station'],
                ['/interface/wireless/set', getIdString(wifi), '=mode=station'],
                ['/interface/wireless/set', getIdString(wifi), '=name=wan2'],
                ['/interface/wireless/set', getIdString(wifi), `=ssid=${spot.name}`],

                ['/interface/bridge/port/disable', getIdString(bridge)],
                ['/interface/ethernet/disable', getIdString(ether, 'provider')],
                ['/interface/list/member/enable', getIdString(list)],

                ['/ip/dhcp-client/enable', getIdString(dhcp)],
            ]);

            log.station(spot);
        } else {
            await mikrotik.write([
                ['/ip/cloud/set', '=ddns-enabled=yes'],

                ['/interface/wireless/set', getIdString(wifi), '=security-profile=default'],
                ['/interface/wireless/set', getIdString(wifi), '=mode=ap-bridge'],
                ['/interface/wireless/set', getIdString(wifi), '=name=wlan1'],
                ['/interface/wireless/set', getIdString(wifi), `=ssid=${wifi2.ssid}`],

                ['/interface/bridge/port/enable', getIdString(bridge)],
                ['/interface/ethernet/enable', getIdString(ether, 'provider')],
                ['/interface/list/member/disable', getIdString(list)],

                ['/ip/dhcp-client/disable', getIdString(dhcp)],
            ]);

            log.station();
        }
    } catch (err) {
        print.ex(err, {full: true, exit: true});
    }
})();
