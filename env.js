import {hideBin} from 'yargs/helpers';
import yargs from 'yargs';

const args = yargs(hideBin(process.argv)).argv._;

export default {
    args: args.length > 0 ? args : [],

    mikrotik: {
        host: process.env.MIKROTIK_HOST,
    },
    next: {
        doh: process.env.NEXT_DNS_DOH,
    },
};
