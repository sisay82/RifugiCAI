import { cleanSheltersToUpdate } from '../tools/stagingArea';
import { CLEAR_CACHE_INTERVAL, getLoginURL, CAS_BASE_URL } from '../tools/constants';
import { logger, LOG_TYPE } from '../tools/common';
import * as mongoose from 'mongoose';
import { checkEnvList } from './env';
import { CasAuth, ICasOption } from '../API/auth/auth.cas';
(<any>mongoose.Promise) = global.Promise;

const CasOptions: ICasOption = {
    url: CAS_BASE_URL + "/cai-cas",
    serviceUrl: getLoginURL()
  };

export const AuthService = new CasAuth(CasOptions);

export function initServer(): boolean {
    if (!checkEnvList()) {
        return false;
    }
    cleanSheltersToUpdate();

    setInterval(cleanSheltersToUpdate, CLEAR_CACHE_INTERVAL);

    logger(LOG_TYPE.INFO, "SERVER INITIALIZED");
    return true;
}

