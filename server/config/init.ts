import { cleanSheltersToUpdate } from '../tools/stagingArea';
import { CLEAR_CACHE_INTERVAL } from '../tools/constants';
import { logger, LOG_TYPE } from '../tools/common';
import * as mongoose from 'mongoose';
import { checkEnvList } from './env';
(<any>mongoose.Promise) = global.Promise;

export function initServer(): boolean {
    if (!checkEnvList()) {
        return false;
    }
    cleanSheltersToUpdate();

    setInterval(cleanSheltersToUpdate, CLEAR_CACHE_INTERVAL);

    logger(LOG_TYPE.INFO, "SERVER INITIALIZED");
    return true;
}

