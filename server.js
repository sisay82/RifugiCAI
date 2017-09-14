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
var appBaseUrl = "http://localhost:4200";
var app = express();
var parsedUrl = encodeURIComponent(appBaseUrl + "/j_spring_cas_security_check");
var userList = [];
var centralRole = "ROLE_RIFUGI_ADMIN";
var regionalRoleName = "PGR";
var sectionalPRoleName = "Responsabile Esterno Sezione";
var sectionalURoleName = "Operatore Sezione Esteso";
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
function getChildsByName(node, name) {
    var nodes = [];
    for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName == name) {
            nodes.push(node.childNodes.item(i));
        }
        if (node.childNodes.item(i).hasChildNodes()) {
            var n = getChildsByName(node.childNodes.item(i), name);
            if (n) {
                nodes = nodes.concat(n);
            }
        }
    }
    return nodes;
}
function getTargetNodesByName(node, name, target) {
    var nodes = [];
    for (var _i = 0, _a = getChildsByName(node, name); _i < _a.length; _i++) {
        var n = _a[_i];
        var child = getChildByName(n, target);
        if (child) {
            nodes.push(child);
        }
    }
    return nodes;
}
function getRole(node) {
    for (var _i = 0, _a = getTargetNodesByName(node, "aggregatedAuthorities", "role"); _i < _a.length; _i++) {
        var n = _a[_i];
        if (n.textContent == centralRole) {
            return enums_1.Enums.User_Type.central;
        }
    }
    var userGroups = getChildByName(node, "userGroups");
    if (userGroups) {
        var name_1 = getChildByName(userGroups, "name");
        if (name_1) {
            if (name_1.textContent == regionalRoleName) {
                return enums_1.Enums.User_Type.regional;
            }
            else {
                if (name_1.textContent == sectionalPRoleName || name_1.textContent == sectionalURoleName) {
                    return enums_1.Enums.User_Type.sectional;
                }
                else {
                    return null;
                }
            }
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
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
                var user = void 0;
                if (getChildByName(el, 'authenticationSuccess')) {
                    res = true;
                    user = getChildByName(el, 'uuid').textContent;
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
function checkUserPromise(uuid) {
    return new Promise(function (resolve, reject) {
        var post_data = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n        <soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n            <soap:Body>\n                <n:getUserDataByUuid xmlns:n=\"http://service.core.ws.auth.cai.it/\">\n                    <arg0>" + uuid + "</arg0>\n                </n:getUserDataByUuid>\n            </soap:Body>\n        </soap:Envelope>";
        request.post({
            url: authUrl,
            method: "POST",
            headers: {
                "Content-Type": "text/xml"
            },
            body: post_data
        }, function (err, response, body) {
            var el = (new DOMParser()).parseFromString(body, "text/xml");
            var role = getRole(el);
            var user = { role: null, code: null };
            user.role = role;
            if (!role) {
                reject();
            }
            else {
                var code = void 0;
                if (role == enums_1.Enums.User_Type.sectional) {
                    code = getChildByName(el, 'sectionCode').textContent;
                }
                else {
                    var tmpCode = getChildByName(el, 'regionaleGroupCode').textContent;
                    if (tmpCode) {
                        code = tmpCode.substr(0, 2) + tmpCode.substr(5, 2) + tmpCode.substr(2, 3);
                    }
                }
                if (code) {
                    user.code = code;
                    resolve(user);
                }
                else {
                    reject();
                }
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
var server = app.listen(process.env.PORT || 4200, function () {
    var port = server.address().port;
    console.log("App now running on " + appBaseUrl);
});
app.get('/logout', function (req, res) {
    var user = userList.findIndex(function (obj) { return obj.id == req.session.id; });
    console.log("Logging out");
    if (user > -1) {
        userList.splice(user, 1);
    }
    res.redirect(casBaseUrl + "/cai-cas/logout");
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
            checkUserPromise(user.uuid)
                .then(function (usr) {
                user.code = usr.code;
                user.role = usr.role;
                res.status(200).send(usr);
            })["catch"](function () {
                res.status(500).send({ error: "Invalid user or request" });
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
                if (user.code == undefined || user.role == undefined) {
                    user.uuid = usr;
                    checkUserPromise(usr)
                        .then(function (us) {
                        console.log("Access granted with role and code: ", enums_1.Enums.User_Type[us.role], us.code);
                        user.code = us.code;
                        user.role = us.role;
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                    })["catch"](function () {
                        console.log("Access denied");
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                        //res.status(200).send("Access Denied <a href='"+casBaseUrl+"/cai-cas/logout"+"'> Logout </a>");
                    });
                }
                else {
                    if (user.role) {
                        console.log("Access granted with role and code: ", user.role, user.code);
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                    }
                    else {
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                        //res.status(200).send("Access Denied");
                    }
                }
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
