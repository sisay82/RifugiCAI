
require('dotenv').config();
import { ENV_CONFIG } from './config/env';
import { initServer } from './config/init';
import * as mongoose from 'mongoose';
import {
    logger,
    LOG_TYPE
} from './tools/common';
import { app } from './config/app';

const createServer = (i: number = 0) => {
    mongoose.connect(ENV_CONFIG.MONGO_URI, {
        useMongoClient: true
    }, function (err) {
        if (err) {
            if (i < 3) {
                logger(LOG_TYPE.ERROR, "CANNOT ESTABLISH CONNECTION. RETRY: ", i + 1)
                logger(LOG_TYPE.ERROR, 'Error mongo connection: ' + err);
                setTimeout(() => {
                    createServer(i + 1)
                }, 5 * 1000)
            } else {
                logger(LOG_TYPE.ERROR, "CANNOT ESTABLISH CONNECTION. CLOSE")
                process.exit()
            }
        } else {
            const server = app.listen(ENV_CONFIG.APP_PORT, function () {
                const port = server.address().port;
                logger(LOG_TYPE.INFO, 'App now running on port', port);
            });
        }
    });
}

if (initServer()) {
    createServer();
} else {
    logger(LOG_TYPE.ERROR, "INITIALIZATION FAILED");
}





