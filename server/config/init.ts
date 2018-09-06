import { swipeUserData } from '../API/auth/userData';
import { cleanSheltersToUpdate } from '../tools/stagingArea';
import { CLEAR_CACHE_INTERVAL, MAX_SESSION_TIME, ENV_LIST } from '../tools/constants';
import { logger, LOG_TYPE } from '../tools/common';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
(<any>mongoose.Promise) = global.Promise;

function checkEnvList(): boolean {
    return ENV_LIST.reduce((acc, val) => {
        return acc && process.env[val] != null;
    }, true);
}

export function initServer(): boolean {
    dotenv.config();
    if (!checkEnvList()) {
        return false;
    }
    swipeUserData();
    cleanSheltersToUpdate();

    setInterval(cleanSheltersToUpdate, CLEAR_CACHE_INTERVAL);
    setInterval(swipeUserData, MAX_SESSION_TIME);

    logger(LOG_TYPE.INFO, "SERVER INITIALIZED");
    return true;
}

