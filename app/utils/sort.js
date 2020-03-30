'use strict';

module.exports = {

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
