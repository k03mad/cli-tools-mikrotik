'use strict';

module.exports = {
    /* eslint-disable jsdoc/require-jsdoc */

    country: (a, b) => {
        if (a.country < b.country) {
            return -1;
        }

        if (a.country > b.country) {
            return 1;
        }

        return 0;
    },

    ping: (a, b) => a.ping - b.ping,
};
