"use strict";
exports.__esModule = true;
var path = require("path");
var https = require("https");
var session = require("express-session");
var xmldom = require("xmldom");
var express = require("express");
var bodyParser = require("body-parser");
var DOMParser = xmldom.DOMParser;
var casBaseUrl = "https://prova.cai.it";
var appBaseUrl = "http://localhost:4200";
var app = express();
var parsedUrl = encodeURIComponent(appBaseUrl + "/j_spring_cas_security_check");
var userList = [];
function validationPromise(ticket) {
    return new Promise(function (resolve, reject) {
        var options = {
            host: "prova.cai.it",
            method: 'GET',
            path: "/cai-cas/serviceValidate?service=" + parsedUrl + "&ticket=" + ticket
        };
        https.get(options, function (res) {
            res.setEncoding('utf8');
            var rawData = '';
            res.on('data', function (chunk) { rawData += chunk; });
            res.on('end', function () {
                try {
                    var el = (new DOMParser()).parseFromString(rawData, "text/html").firstChild;
                    var res_1 = false;
                    for (var i = 0; i < el.childNodes.length; i++) {
                        if (el.childNodes.item(i).localName) {
                            if (el.childNodes.item(i).localName == "authenticationSuccess") {
                                res_1 = true;
                            }
                        }
                    }
                    if (res_1) {
                        resolve(el);
                    }
                    else {
                        reject(null);
                    }
                }
                catch (e) {
                    reject(null);
                }
            });
        }).on('error', function (e) {
            console.log(e);
            reject(null);
        });
    });
}
app.use(bodyParser.urlencoded({
    extended: true
}), session({
    secret: '24e9v81i3ourgfhsd8i7vg1or3f5',
    resave: false,
    saveUninitialized: true
}));
var server = app.listen(process.env.PORT || 4200, function () {
    var port = server.address().port;
    console.log("App now running on " + appBaseUrl);
});
app.get('/logout', function (req, res) {
    var user = userList.findIndex(function (obj) { return obj.id == req.session.id; });
    console.log("Logging out");
    //var parsedUrl=encodeURIComponent(appBaseUrl);
    if (user > -1) {
        userList.splice(user, 1);
    }
    res.redirect(casBaseUrl + "/cai-cas/logout?service=" + parsedUrl);
});
app.get('/j_spring_cas_security_check', function (req, res) {
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (user) {
        user.ticket = req.query.ticket;
        res.redirect(user.resource);
    }
    else {
        console.log("Invalid user request");
        userList.push({ id: req.session.id, resource: appBaseUrl });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
});
app.get('/validate', function (req, res, next) {
    var parsedUrl = encodeURIComponent(appBaseUrl + "/validate/j_spring_cas_security_check");
    res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
});
app.get("/validate/j_spring_cas_security_check", function (req, res, next) {
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (user) {
        user.ticket = req.query.ticket;
        res.redirect(user.resource);
    }
    else {
        console.log("Invalid user request");
        userList.push({ id: req.session.id, resource: appBaseUrl });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
});
app.get('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect("/list");
});
app.use(express.static(__dirname + '/dist'));
app.get('/*', function (req, res) {
    console.log(req.method + " REQUEST: " + JSON.stringify(req.query));
    console.log(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (!user) {
        console.log("User not logged");
        userList.push({ id: req.session.id, resource: req.path });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
    else {
        if (user.ticket) {
            console.log("Checking ticket");
            console.log(user.ticket);
            validationPromise(user.ticket)
                .then(function (response) {
                console.log("Valid ticket");
                res.sendFile(path.join(__dirname + '/dist/index.html'));
            })["catch"](function (err) {
                console.log("Invalid ticket");
                user.resource = req.path;
                res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
            });
        }
        else {
            console.log("Invalid user ticket");
            user.resource = req.path;
            res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
        }
    }
});
