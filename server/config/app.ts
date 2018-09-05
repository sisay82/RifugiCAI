import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as session from 'express-session';
import {
    logger,
    LOG_TYPE
} from '../tools/common';
import { fileRoute } from '../API/files/files.routes';
import { appRoute } from '../API/shelters/shelters.routes';
import { authRoute } from '../API/auth/auth.routes';
import { getUserData } from '../API/auth/auth.logic'
import { MongoStore as ms} from 'connect-mongo';
import { UserDataTools } from '../API/auth/userData';

const app = express();
const MongoStore = require('connect-mongo')(session);
const store: ms = new MongoStore({ mongooseConnection: mongoose.connection });
store.on('destroy', (sid) => {
    logger(LOG_TYPE.INFO, 'DELETE USER SESSION SID: ' + sid);
    UserDataTools.deleteDataSession(sid);
});

app.use(bodyParser.urlencoded({
    extended: true
}), session({
    secret: 'ytdv6w4a2wzesdc7564uybi6n0m9pmku4esx',
    store: store,
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

export { app };