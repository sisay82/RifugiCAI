"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var session = require("express-session");
var bodyParser = require("body-parser");
var express = require("express");
var common_1 = require("./tools/common");
var files_api_1 = require("./API/files.api");
var shelters_api_1 = require("./API/shelters.api");
var auth_api_1 = require("./API/auth.api");
var MongoStore = require('connect-mongo')(session);
mongoose.Promise = global.Promise;
exports.APP_PORT = 8000;
exports.APP_BASE_URL = 'http://localhost:' + exports.APP_PORT;
exports.PARSED_URL = encodeURIComponent(exports.APP_BASE_URL + '/j_spring_cas_security_check');
var app = express();
var Users = [];
// 'mongodb://localhost:27017/ProvaDB',process.env.MONGODB_URI
var mongooseConnection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB', {
    useMongoClient: true
}, function (err) {
    if (err) {
        common_1.logger('Error connection: ' + err);
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
    common_1.logger('SessionID: ' + req.sessionID + ', METHOD: ' + req.method + ', QUERY: ' + JSON.stringify(req.query) + ', PATH: ' + req.path);
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type';
        headers['content-type'] = 'application/json; charset=utf-8';
        res.writeHead(200, headers);
        res.end();
    }
    else {
        auth_api_1.getUserData(req.session.id)
            .then(function (userData) {
            req.body.user = userData;
            next();
        })
            .catch(function (err) {
            res.status(500).send({ error: err });
        });
    }
}, files_api_1.fileRoute, shelters_api_1.appRoute);
app.use('/', function (req, res, next) {
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers['Access-Control-Allow-Headers'] = 'Content-Type';
        headers['content-type'] = 'text/html; charset=UTF-8';
        res.writeHead(200, headers);
        res.end();
    }
    else {
        next();
    }
}, auth_api_1.authRoute);
var server = app.listen(process.env.PORT || exports.APP_PORT, function () {
    var port = server.address().port;
    common_1.logger('App now running on port', port);
});
//# sourceMappingURL=server.js.map