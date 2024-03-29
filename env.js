import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

const args = yargs(hideBin(process.argv)).argv._;

export default {
    args: args.length > 0 ? args : [],

    mikrotik: {
        host: process.env.MIKROTIK_HOST,
        doh: process.env.MIKROTIK_DOH,
    },
};
