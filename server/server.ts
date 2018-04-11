import * as mongoose from 'mongoose';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { IOpening, IContribution } from '../src/app/shared/types/interfaces';
import { Schema } from '../src/app/shared/types/schema';
import { Enums } from '../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import https = require('https');
import fs = require('fs');
import * as path from 'path';
import {
    SheltersToUpdate,
    IServiceExtended,
    IShelterExtended,
    IFileExtended,
    logger,
    LOG_TYPE
} from './tools/common';
import { OUT_DIR } from './tools/constants';
import { fileRoute } from './API/files.api';
import { appRoute } from './API/shelters.api';
import { authRoute, getUserData } from './API/auth.api';
const MongoStore = require('connect-mongo')(session);

const SERVER_URL = "localhost:";
export const APP_PORT = process.env.PORT || 8000;
export const APP_BASE_URL = 'http://' + SERVER_URL + APP_PORT;
export const PARSED_URL = encodeURIComponent(APP_BASE_URL + '/j_spring_cas_security_check');
const app = express();
const Users: String[] = [];

// 'mongodb://localhost:27017/ProvaDB',process.env.MONGODB_URI
const mongooseConnection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB', {
    useMongoClient: true
}, function (err) {
    if (err) {
        logger(LOG_TYPE.ERROR, 'Error connection: ' + err);
    }
});

app.use(bodyParser.urlencoded({
    extended: true
}), session({
    secret: 'ytdv6w4a2wzesdc7564uybi6n0m9pmku4esx',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 1000 * 60 * 40 },
    resave: false,
    saveUninitialized: true
}), bodyParser.json());

app.use('/api', function (req, res, next) {
    logger(LOG_TYPE.INFO,
        'SessionID: ' + req.sessionID + ', METHOD: ' + req.method + ', QUERY: ' + JSON.stringify(req.query) + ', PATH: ' + req.path);
    if (req.method === 'OPTIONS') {
        const headers = {};
        headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type';
        headers['content-type'] = 'application/json; charset=utf-8';
        res.writeHead(200, headers);
        res.end();
    } else {
        getUserData(req.session.id)
            .then(userData => {
                req.body.user = userData;
                next();
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({ error: 'Invalid user or request' });
            });
    }
}, fileRoute, appRoute);

app.use('/', function (req, res, next) {
    if (req.method === 'OPTIONS') {
        const headers = {};
        headers['Access-Control-Allow-Headers'] = 'Content-Type';
        headers['content-type'] = 'text/html; charset=UTF-8';
        res.writeHead(200, headers);
        res.end();
    } else {
        next();
    }
}, authRoute);

const server = app.listen(process.env.PORT || APP_PORT, function () {
    const port = server.address().port;
    logger(LOG_TYPE.INFO, 'App now running on port', port);
});
