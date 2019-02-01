import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as session from "express-session";
import { logger, LOG_TYPE } from "../tools/common";
import { fileRoute } from "../API/files/files.routes";
import { appRoute } from "../API/shelters/shelters.routes";
import { authRoute } from "../API/auth/auth.routes";
import { MAX_SESSION_TIME } from "../tools/constants";
import * as ConnectMongo from "connect-mongo";
import { AuthService } from "./init";
import { ENV_CONFIG } from "./env";

const app = express();
const MongoStore = ConnectMongo(session);
const ALLOWED_ORIGINS = [
    "https://infomont-cai.herokuapp.com",
    "https://rifugi.cai.it",
    "http://unico.rifugi.cai.it",
    "https://unico.rifugi.cai.it"
];

export const store = new MongoStore({
    mongooseConnection: mongoose.connection
});

store.on("destroy", sid => {
    logger(LOG_TYPE.INFO, "DELETE USER SESSION SID: " + sid);
});

app.disable("x-powered-by");
app.use(
    bodyParser.urlencoded({
        extended: true
    }),
    session({
        secret: process.env.SESSION_SECRET,
        store: store,
        cookie: { maxAge: MAX_SESSION_TIME },
        resave: false,
        saveUninitialized: true,
        name: "sessionId"
    }),
    bodyParser.json()
);

app.use(
    "/api",
    function(req, res, next) {
        logger(
            LOG_TYPE.INFO,
            "SessionID: " +
                req.sessionID +
                ", METHOD: " +
                req.method +
                ", QUERY: " +
                JSON.stringify(req.query) +
                ", PATH: " +
                req.path
        );
        const origin = <string>req.headers.origin;

        if (origin && (ENV_CONFIG.DEV || ALLOWED_ORIGINS.indexOf(origin) > -1)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }

        if (req.method === "OPTIONS") {
            const headers = {};
            headers["Access-Control-Allow-Methods"] =
                "POST, GET, PUT, DELETE, OPTIONS";
            headers["Access-Control-Allow-Headers"] =
                "Content-Type, application/x-www-form-urlencoded, Authorization";
            headers["content-type"] = "application/json; charset=utf-8";
            res.writeHead(200, headers);
            res.end();
        } else {
            next();
        }
    },
    fileRoute,
    appRoute
);

app.use(
    "/",
    function(req, res, next) {
        if (req.method === "OPTIONS") {
            const headers = {};
            headers["Access-Control-Allow-Headers"] = "Content-Type";
            headers["content-type"] = "text/html; charset=UTF-8";
            res.writeHead(200, headers);
            res.end();
        } else {
            next();
        }
    },
    authRoute
);

export { app };
