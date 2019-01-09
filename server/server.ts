
require('dotenv').config();
import { ENV_CONFIG } from './config/env';
import { initServer } from './config/init';
import * as mongoose from 'mongoose';
import {
    logger,
    LOG_TYPE
} from './tools/common';
import { app } from './config/app';

const closeServer = server => {
    server.close(function (err) {
        if (err) {
            logger(LOG_TYPE.ERROR, err);
            process.exit(2)
        }

        mongoose.connection.close(function () {
            logger(LOG_TYPE.INFO, "Closed mongoose connections and exiting...");
            process.exit(0)
        })
    })
}

const setupStopINT = (server) => {
    process.on('SIGINT', () => {
        logger(LOG_TYPE.WARNING, 'SIGINT signal received');
        closeServer(server);
    });

    process.on('message', (msg) => {
        if (msg === 'shutdown') {
            logger(LOG_TYPE.WARNING, 'SHUTDOWN message received');
            closeServer(server);
        }
    })
}

const createServer = (i: number = 0) => {
    mongoose.connect(ENV_CONFIG.MONGO_URI, function (err) {
        if (err) {
            if (i < 3) {
                logger(LOG_TYPE.ERROR, "CANNOT ESTABLISH CONNECTION. RETRY: ", i + 1)
                logger(LOG_TYPE.ERROR, 'Error mongo connection: ' + err);
                setTimeout(() => {
                    createServer(i + 1)
                }, 5 * 1000)
            } else {
                logger(LOG_TYPE.ERROR, "CANNOT ESTABLISH CONNECTION. CLOSE")
                process.exit(1)
            }
        } else {
            const server = app.listen(ENV_CONFIG.APP_PORT, function () {
                const port = (<any>server.address()).port;
                logger(LOG_TYPE.INFO, 'App now running on port', port);
            });
            setupStopINT(server);
        }
    });
}

if (initServer()) {
    createServer();
} else {
    logger(LOG_TYPE.ERROR, "INITIALIZATION FAILED");
}





