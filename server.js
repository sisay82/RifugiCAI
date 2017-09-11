"use strict";
exports.__esModule = true;
var path = require("path");
var session = require("express-session");
var xmldom = require("xmldom");
var request = require("request");
var express = require("express");
var bodyParser = require("body-parser");
var enums_1 = require("./src/app/shared/types/enums");
var DOMParser = xmldom.DOMParser;
var casBaseUrl = "https://prova.cai.it";
var authUrl = "http://prova.cai.it/cai-auth-ws/AuthService/getUserDataByUuid";
var serverUrl = "localhost";
var portUrl = 4200;
var appBaseUrl = "http://" + serverUrl + ":" + portUrl;
var app = express();
var parsedUrl = encodeURIComponent(appBaseUrl + "/j_spring_cas_security_check");
var userList = [];
function getChildByName(node, name) {
    for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName == name) {
            return node.childNodes.item(i);
        }
        if (node.childNodes.item(i).hasChildNodes()) {
            var n = getChildByName(node.childNodes.item(i), name);
            if (n) {
                return n;
            }
        }
    }
    return null;
}
function validationPromise(ticket) {
    return new Promise(function (resolve, reject) {
        request.post({
            url: casBaseUrl + "/cai-cas/serviceValidate?service=" + parsedUrl + "&ticket=" + ticket,
            method: "GET"
        }, function (err, response, body) {
            try {
                var el = (new DOMParser()).parseFromString(body, "text/xml").firstChild;
                var res = false;
                var user = {};
                if (getChildByName(el, 'authenticationSuccess')) {
                    res = true;
                    user.uuid = getChildByName(el, 'uuid').textContent;
                    /**
                     * SET ROLE
                     */
                    //DEV
                    user.role = enums_1.Enums.User_Type.sectional;
                    /** */
                }
                if (res) {
                    resolve(user);
                }
                else {
                    reject(null);
                }
            }
            catch (e) {
                console.log(e);
                reject(null);
            }
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
var server = app.listen(portUrl, serverUrl, function () {
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
app.get('/user', function (req, res, next) {
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    console.log("User permissions request (UUID): ", user.uuid);
    if (user != undefined && user.uuid != undefined) {
        if (user.code == undefined || user.role == undefined) {
            var post_data = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n            <soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n                <soap:Body>\n                    <n:getUserDataByUuid xmlns:n=\"http://service.core.ws.auth.cai.it/\">\n                        <arg0>" + user.uuid + "</arg0>\n                    </n:getUserDataByUuid>\n                </soap:Body>\n            </soap:Envelope>";
            request.post({
                url: authUrl,
                method: "POST",
                headers: {
                    "Content-Type": "text/xml"
                },
                body: post_data
            }, function (err, response, body) {
                var el = (new DOMParser()).parseFromString(body, "text/xml");
                var code = getChildByName(el, 'sectionCode').textContent;
                if (code) {
                    user.code = code;
                    res.status(200).send({ code: user.code, role: user.role });
                }
                else {
                    res.status(500).send({ 'error': 'Error user request' });
                }
            });
        }
        else {
            res.status(200).send({ code: user.code, role: user.role });
        }
    }
    else {
        console.log("User not logged");
        userList.push({ id: req.session.id, resource: appBaseUrl + '/list' });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
});
app.get('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect("/list");
});
app.use(express.static(__dirname + '/dist'));
app.get('/*', function (req, res) {
    console.log(req.method + " REQUEST: " + JSON.stringify(req.query));
    console.log(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (!user) {
        console.log("User not logged");
        userList.push({ id: req.session.id, resource: req.path });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
    else {
        if (user.ticket) {
            console.log("Checking ticket: ", user.ticket);
            validationPromise(user.ticket)
                .then(function (usr) {
                console.log("Valid ticket");
                user.uuid = usr.uuid;
                user.role = usr.role;
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
