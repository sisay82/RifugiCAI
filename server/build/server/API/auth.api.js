"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("../../src/app/shared/types/enums");
var express = require("express");
var Auth_Permissions = enums_1.Enums.Auth_Permissions;
var common_1 = require("../tools/common");
var constants_1 = require("../tools/constants");
var server_1 = require("../server");
var xmldom = require("xmldom");
var path = require("path");
var DOMParser = xmldom.DOMParser;
exports.DISABLE_AUTH = false;
var centralRole = ['ROLE_RIFUGI_ADMIN'];
var regionalRoleName = ['PGR'];
var sectionalRoleName = ['ROLE_MEMBERS_VIEW', 'ROLE_MEMBERSHIP' /*,'Responsabile Esterno Sezione','Operatore Sezione Esteso'*/];
var casBaseUrl = 'https://accesso.cai.it';
var authUrl = 'https://services.cai.it/cai-integration-ws/secured/users/';
var userList = [];
function getUserData(sessionID) {
    return new Promise(function (resolve, reject) {
        if (exports.DISABLE_AUTH) {
            var user = {
                id: sessionID,
                redirections: 0,
                checked: true,
                code: '9999999',
                role: Auth_Permissions.User_Type.superUser
            };
            resolve(user);
        }
        else {
            var user = userList.find(function (obj) { return obj.id === sessionID; });
            if (user && user.checked && user.role && user.code) {
                resolve(user);
            }
            else {
                reject({ error: 'Unauthorized User' });
            }
        }
    });
}
exports.getUserData = getUserData;
function getChildByName(node, name) {
    for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName === name) {
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
        if (node.childNodes.item(i).localName === name) {
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
function checkInclude(source, target, attribute) {
    if (source) {
        return source.reduce(function (ret, item) {
            if (target.find(function (obj) { return obj.indexOf(item[attribute]) > -1; })) {
                return true;
            }
            else {
                return ret;
            }
        }, false);
    }
    else {
        return false;
    }
}
function getRole(data) {
    if (data) {
        if (checkInclude(data.aggregatedAuthorities, centralRole, 'role')) {
            return Auth_Permissions.User_Type.central;
        }
        else if (checkInclude(data.userGroups, regionalRoleName, 'name')) {
            return Auth_Permissions.User_Type.regional;
        }
        else if (checkInclude(data.aggregatedAuthorities, sectionalRoleName, 'role')) {
            return Auth_Permissions.User_Type.sectional;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
function getCode(type, data) {
    var code = null;
    if (type) {
        if (type === Auth_Permissions.User_Type.sectional) {
            if (data.sectionCode) {
                code = data.sectionCode;
            }
        }
        else {
            if (data.regionaleGroupCode) {
                var tmpCode = data.regionaleGroupCode;
                if (tmpCode) {
                    code = tmpCode.substr(0, 2) + tmpCode.substr(5, 2) + tmpCode.substr(2, 3);
                }
            }
        }
    }
    return code;
}
function getUserPermissions(data) {
    var role = getRole(data);
    var code = getCode(role, data);
    if (role === Auth_Permissions.User_Type.regional && code.substr(0, 2) === '93') {
        role = Auth_Permissions.User_Type.area;
    }
    return { role: role, code: code };
}
function checkUserPromise(uuid) {
    common_1.logger('CHECKUSER');
    return new Promise(function (resolve, reject) {
        if (exports.DISABLE_AUTH) {
            resolve({ role: Auth_Permissions.User_Type.superUser, code: '9999999' });
        }
        else {
            common_1.performRequestGET(authUrl + uuid + '/full', 'Basic YXBwcmlmdWdpQGNhaS5pdDpiZXN1Z1U3UjJHdWc=')
                .then(function (value) {
                try {
                    var data = JSON.parse(value.body);
                    var user = getUserPermissions(data);
                    if (user.role) {
                        if (user.code) {
                            resolve(user);
                        }
                        else {
                            reject('Error code');
                        }
                    }
                    else {
                        reject('User not authorized');
                    }
                }
                catch (e) {
                    reject(e);
                }
            })
                .catch(function (err) {
                common_1.logger(err);
                reject(err);
            });
        }
    });
}
function validationPromise(ticket) {
    return new Promise(function (resolve, reject) {
        if (exports.DISABLE_AUTH) {
            resolve(null);
        }
        else {
            var url = casBaseUrl + '/cai-cas/serviceValidate?service=' + server_1.PARSED_URL + '&ticket=' + ticket;
            common_1.performRequestGET(url)
                .then(function (value) {
                var parser = new DOMParser({
                    locator: {},
                    errorHandler: {
                        warning: function (w) {
                            reject(w);
                        }
                    }
                });
                var el = parser.parseFromString(value.body, 'text/xml');
                if (el) {
                    var doc = el.firstChild;
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
                        reject({ error: 'Authentication error' });
                    }
                }
                else {
                    reject({ error: 'Document parsing error' });
                }
            })
                .catch(function (err) {
                common_1.logger(err);
                reject(err);
            });
        }
    });
}
exports.authRoute = express.Router();
exports.authRoute.get('/logout', function (req, res) {
    if (exports.DISABLE_AUTH) {
        res.redirect('/list');
    }
    else {
        var user = userList.findIndex(function (obj) { return obj.id === req.session.id; });
        common_1.logger('Logging out');
        if (user > -1) {
            userList.splice(user, 1);
        }
        res.redirect(casBaseUrl + '/cai-cas/logout');
    }
});
exports.authRoute.get('/j_spring_cas_security_check', function (req, res) {
    if (exports.DISABLE_AUTH) {
        res.redirect('/list');
    }
    else {
        var user = userList.find(function (obj) { return obj.id === req.session.id; });
        if (user) {
            user.ticket = req.query.ticket;
            res.redirect(user.resource.toString());
        }
        else {
            common_1.logger('Invalid user request');
            userList.push({ id: req.session.id, resource: server_1.APP_BASE_URL, redirections: 0, checked: false });
            res.redirect(casBaseUrl + '/cai-cas/login?service=' + server_1.PARSED_URL);
        }
    }
});
exports.authRoute.get('/user', function (req, res, next) {
    if (exports.DISABLE_AUTH) {
        res.status(200).send({ code: '9999999', role: Auth_Permissions.User_Type.superUser });
    }
    else {
        var user_1 = userList.find(function (obj) { return obj.id === req.session.id; });
        common_1.logger('User permissions request (UUID): ', user_1.uuid);
        if (user_1 && user_1.uuid) {
            if (!user_1.code || !user_1.role) {
                if (user_1.checked) {
                    user_1.checked = false;
                    res.status(500).send({ error: 'Invalid user or request' });
                }
                else {
                    checkUserPromise(user_1.uuid)
                        .then(function (usr) {
                        user_1.code = usr.code;
                        user_1.role = usr.role;
                        res.status(200).send(usr);
                    })
                        .catch(function () {
                        res.status(500).send({ error: 'Invalid user or request' });
                    });
                }
            }
            else {
                res.status(200).send({ code: user_1.code, role: user_1.role });
            }
        }
        else {
            common_1.logger('User not logged');
            userList.push({ id: req.session.id, resource: server_1.APP_BASE_URL + '/list', redirections: 0, checked: false });
            res.redirect(casBaseUrl + '/cai-cas/login?service=' + server_1.PARSED_URL);
        }
    }
});
exports.authRoute.get('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect('/list');
});
exports.authRoute.use(express.static(constants_1.OUT_DIR));
exports.authRoute.get('/*', function (req, res) {
    common_1.logger(req.method + ' REQUEST: ' + JSON.stringify(req.query));
    common_1.logger(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    if (exports.DISABLE_AUTH) {
        res.sendFile(path.join(constants_1.OUT_DIR + '/index.html'));
    }
    else {
        var user_2 = userList.find(function (obj) { return obj.id === req.session.id; });
        if (!user_2) {
            common_1.logger('User not logged');
            userList.push({ id: req.session.id, resource: req.path, redirections: 0, checked: false });
            res.redirect(casBaseUrl + '/cai-cas/login?service=' + server_1.PARSED_URL);
        }
        else {
            if (user_2.ticket) {
                common_1.logger('Checking ticket: ', user_2.ticket);
                validationPromise(user_2.ticket)
                    .then(function (usr) {
                    common_1.logger('Valid ticket');
                    user_2.checked = true;
                    user_2.redirections = 0;
                    if (!user_2.code || !user_2.role) {
                        user_2.uuid = usr;
                        checkUserPromise(usr)
                            .then(function (us) {
                            common_1.logger('Access granted with role and code: ', Auth_Permissions.User_Type[us.role], us.code);
                            user_2.code = us.code;
                            user_2.role = us.role;
                            res.sendFile(path.join(constants_1.OUT_DIR + '/index.html'));
                        })
                            .catch(function () {
                            common_1.logger('Access denied');
                            res.sendFile(path.join(constants_1.OUT_DIR + '/index.html'));
                        });
                    }
                    else {
                        if (user_2.role) {
                            common_1.logger('Access granted with role and code: ', user_2.role, user_2.code);
                            res.sendFile(path.join(constants_1.OUT_DIR + '/index.html'));
                        }
                        else {
                            res.sendFile(path.join(constants_1.OUT_DIR + '/index.html'));
                        }
                    }
                })
                    .catch(function (err) {
                    common_1.logger('Invalid ticket', err);
                    user_2.redirections++;
                    user_2.checked = false;
                    user_2.resource = req.path;
                    if (user_2.redirections >= 3) {
                        var index = userList.findIndex(function (obj) { return obj.id === user_2.id; });
                        userList.splice(index, 1);
                        res.status(500).send("Error, try logout <a href='" + casBaseUrl + '/cai-cas/logout' + "'>here</a> before try again.\n                        <br>Error info:<br><br>" + err);
                    }
                    else {
                        res.redirect(casBaseUrl + '/cai-cas/login?service=' + server_1.PARSED_URL);
                    }
                });
            }
            else {
                common_1.logger('Invalid user ticket');
                user_2.resource = req.path;
                user_2.redirections++;
                if (user_2.redirections >= 3) {
                    var index = userList.findIndex(function (obj) { return obj.id === user_2.id; });
                    userList.splice(index, 1);
                    res.status(500).send('Error, try logout <a href="' + casBaseUrl + '/cai-cas/logout' + '">here</a> before try again');
                }
                else {
                    res.redirect(casBaseUrl + '/cai-cas/login?service=' + server_1.PARSED_URL);
                }
            }
        }
    }
});
//# sourceMappingURL=auth.api.js.map