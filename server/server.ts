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
    logger
} from './common';
import { OUT_DIR } from './constants';
import {fileRoute} from './API/files.api';
import {appRoute} from './API/shelters.api';
import {authRoute, DISABLE_AUTH, userList} from './API/auth.api';
const MongoStore = require('connect-mongo')(session);

(<any>mongoose.Promise) = global.Promise;

export const APP_PORT = 8000;
export const APP_BASE_URL = 'http://localhost:' + APP_PORT;
export const PARSED_URL = encodeURIComponent(APP_BASE_URL + '/j_spring_cas_security_check');
const app = express();
const Users: String[] = [];

// 'mongodb://localhost:27017/ProvaDB',process.env.MONGODB_URI
const mongooseConnection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB', {
    useMongoClient: true
}, function(err) {
    if (err) {
        logger('Error connection: ' + err);
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

app.use('/api', function(req , res, next) {
    logger('SessionID: ' + req.sessionID + ', METHOD: '  + req.method + ', QUERY: ' + JSON.stringify(req.query) + ', PATH: ' + req.path);
    if (req.method === 'OPTIONS') {
        const headers = {};
        headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type';
        headers['content-type'] = 'application/json; charset=utf-8';
        res.writeHead(200, headers);
        res.end();
    } else {
        if (DISABLE_AUTH) {
            req.body.user = {code: '9999999', role: Auth_Permissions.User_Type.superUser};
            next();
        } else {
            const user = userList.find(obj => obj.id === req.session.id);
            if (user && user.checked && user.role && user.code) {
                req.body.user = user;
                next();
            } else {
                res.status(500).send({error: 'Unauthenticated user'});
            }
        }
    }
}, fileRoute, appRoute);

app.use('/', function(req, res, next) {
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
    logger('App now running on port', port);
});