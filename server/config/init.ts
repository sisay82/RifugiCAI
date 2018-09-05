import { swipeUserData } from '../API/auth/userData';
import { cleanSheltersToUpdate } from '../tools/stagingArea';
import { CLEAR_CACHE_INTERVAL, MAX_SESSION_TIME } from '../tools/constants';
import { logger, LOG_TYPE } from '../tools/common';
import * as mongoose from 'mongoose';
(<any>mongoose.Promise) = global.Promise;

swipeUserData();
cleanSheltersToUpdate();

setInterval(cleanSheltersToUpdate, CLEAR_CACHE_INTERVAL);
setInterval(swipeUserData, MAX_SESSION_TIME);

logger(LOG_TYPE.INFO, "SERVER INITIALIZED");
