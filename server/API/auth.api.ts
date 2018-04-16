import { Enums } from '../../src/app/shared/types/enums';
import * as express from 'express';
import Auth_Permissions = Enums.Auth_Permissions;
import { logger, UserData, performRequestGET, LOG_TYPE } from '../tools/common';
import { OUT_DIR } from '../tools/constants';
import { PARSED_URL, APP_BASE_URL } from '../server';
import xmldom = require('xmldom');
import * as path from 'path';
const DOMParser = xmldom.DOMParser;

export const DISABLE_AUTH = false;

const casBaseUrl = 'https://accesso.cai.it';
const authUrl = 'https://services.cai.it/cai-integration-ws/secured/users/';
const userList: UserData[] = [];

export function getUserData(sessionID: string): Promise<UserData> {
    return new Promise<UserData>((resolve, reject) => {
        if (DISABLE_AUTH) {
            const user: UserData = {
                id: sessionID,
                redirections: 0,
                checked: true,
                code: '9999999',
                role: Auth_Permissions.User_Type.superUser
            };
            resolve(user);
        } else {
            const user = userList.find(obj => String(obj.id) === sessionID);
            if (user && user.checked && user.role && user.code) {
                resolve(user);
            } else {
                reject({ error: 'Unauthorized User' });
            }
        }
    });
}

function getChildByName(node: Node, name: String): Node {
    for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName === name) {
            return node.childNodes.item(i);
        }
        if (node.childNodes.item(i).hasChildNodes()) {
            const n = getChildByName(node.childNodes.item(i), name);
            if (n) {
                return n;
            }
        }
    }
    return null;
}

function getChildsByName(node: Node, name: String): Node[] {
    let nodes: Node[] = [];
    for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName === name) {
            nodes.push(node.childNodes.item(i));
        }
        if (node.childNodes.item(i).hasChildNodes()) {
            const n = getChildsByName(node.childNodes.item(i), name);
            if (n) {
                nodes = nodes.concat(n);
            }
        }
    }
    return nodes;
}

function getTargetNodesByName(node: Node, name: String, target: String): Node[] {
    const nodes: Node[] = [];
    for (const n of getChildsByName(node, name)) {
        const child = getChildByName(n, target);
        if (child) {
            nodes.push(child);
        }
    }
    return nodes;
}

function checkInclude(source: any[], target: any[], attribute): boolean {
    if (source) {
        return source.reduce((ret, item) => {
            if (target.find(obj => obj.indexOf(item[attribute]) > -1)) {
                return true;
            } else {
                return ret;
            }
        }, false);
    } else {
        return false;
    }
}

function getRole(data): Auth_Permissions.User_Type {
    if (data) {
        if (checkInclude(data.aggregatedAuthorities, Auth_Permissions.getUserRolesByType[Auth_Permissions.User_Type.central], 'role')) {
            return Auth_Permissions.User_Type.central;
        } else if (checkInclude(data.userGroups, Auth_Permissions.getUserRolesByType[Auth_Permissions.User_Type.regional], 'name')) {
            return Auth_Permissions.User_Type.regional;
        } else if (checkInclude(data.aggregatedAuthorities,
            Auth_Permissions.getUserRolesByType[Auth_Permissions.User_Type.sectional], 'role')) {
            return Auth_Permissions.User_Type.sectional;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function getCode(type: Auth_Permissions.User_Type, data): String {
    let code = null;
    if (type) {
        if (type === Auth_Permissions.User_Type.sectional) {
            if (data.sectionCode) {
                code = data.sectionCode;
            }
        } else {
            if (data.regionaleGroupCode) {
                const tmpCode = data.regionaleGroupCode;
                if (tmpCode) {
                    code = tmpCode.substr(0, 2) + tmpCode.substr(5, 2) + tmpCode.substr(2, 3);
                }
            }
        }
    }
    return code;
}

function getUserPermissions(data): { role: Auth_Permissions.User_Type, code: String } {
    let role = getRole(data);
    const code = getCode(role, data);
    if (role === Auth_Permissions.User_Type.regional && code.substr(0, 2) === '93') {
        role = Auth_Permissions.User_Type.area;
    }
    return { role: role, code: code };
}

function checkUserPromise(uuid): Promise<{ role: Auth_Permissions.User_Type, code: String }> {
    logger(LOG_TYPE.INFO, 'CHECKUSER');
    return new Promise<{ role: Auth_Permissions.User_Type, code: String }>((resolve, reject) => {
        //resolve({ role: Auth_Permissions.User_Type.area, code: "9350000" });

        if (DISABLE_AUTH) {
            resolve({ role: Auth_Permissions.User_Type.superUser, code: '9999999' });
        } else {
            performRequestGET(authUrl + uuid + '/full', 'Basic YXBwcmlmdWdpQGNhaS5pdDpiZXN1Z1U3UjJHdWc=', 1000 * 10)
                .then(value => {
                    try {
                        const data = JSON.parse(value.body);
                        const user: { role: Auth_Permissions.User_Type, code: String } = getUserPermissions(data);
                        if (user.role) {
                            if (user.code) {
                                resolve(user);
                            } else {
                                reject('Error code');
                            }
                        } else {
                            reject('User not authorized');
                        }
                    } catch (e) {
                        reject(e);
                    }
                })
                .catch(err => {
                    logger(LOG_TYPE.WARNING, err);
                    reject(err);
                });
        }
    });
}

function validationPromise(ticket): Promise<String> {
    return new Promise((resolve, reject) => {
        if (DISABLE_AUTH) {
            resolve(null)
        } else {
            const url = casBaseUrl + '/cai-cas/serviceValidate?service=' + PARSED_URL + '&ticket=' + ticket
            performRequestGET(url)
                .then(value => {
                    const parser = new DOMParser({
                        locator: {},
                        errorHandler: {
                            warning: function (w) {
                                reject(w);
                            }
                        }
                    });
                    const el: Document = parser.parseFromString(value.body, 'text/xml');
                    if (el) {
                        const doc = el.firstChild;
                        let res = false;
                        let user: String;
                        if (getChildByName(el, 'authenticationSuccess')) {
                            res = true;
                            user = getChildByName(el, 'uuid').textContent;
                        }
                        if (res) {
                            resolve(user);
                        } else {
                            reject({ error: 'Authentication error' });
                        }
                    } else {
                        reject({ error: 'Document parsing error' });
                    }
                })
                .catch(err => {
                    logger(LOG_TYPE.WARNING, err);
                    reject(err);
                });
        }
    });
}

export const authRoute = express.Router();

authRoute.get('/logout', function (req, res) {
    if (DISABLE_AUTH) {
        res.redirect('/list');
    } else {
        const user = userList.findIndex(obj => String(obj.id) === req.session.id);
        logger(LOG_TYPE.INFO, 'Logging out user ' + user);

        if (user > -1) {
            userList.splice(user, 1);
        }
        res.redirect(casBaseUrl + '/cai-cas/logout');
    }
});

authRoute.get('/j_spring_cas_security_check', function (req, res) {
    if (DISABLE_AUTH) {
        res.redirect('/list');
    } else {
        const user = userList.find(obj => String(obj.id) === req.session.id);
        if (user) {
            user.ticket = req.query.ticket;
            res.redirect(user.resource.toString());
        } else {
            logger(LOG_TYPE.WARNING, 'Invalid user request');
            userList.push({ id: req.session.id, resource: APP_BASE_URL, redirections: 0, checked: false });
            res.redirect(casBaseUrl + '/cai-cas/login?service=' + PARSED_URL);
        }
    }
});

authRoute.get('/user', function (req, res, next) {
    if (DISABLE_AUTH) {
        res.status(200).send({ code: '9999999', role: Auth_Permissions.User_Type.superUser });
    } else {
        const user = userList.find(obj => String(obj.id) === req.session.id);
        logger(LOG_TYPE.INFO, 'User permissions request (UUID): ', user.uuid);
        if (user && user.uuid) {
            if (!user.code || !user.role) {
                if (user.checked) {
                    user.checked = false;
                    res.status(500).send({ error: 'Invalid user or request' });
                } else {
                    checkUserPromise(user.uuid)
                        .then(usr => {
                            user.code = usr.code;
                            user.role = usr.role;
                            res.status(200).send(usr);
                        })
                        .catch(() => {
                            res.status(500).send({ error: 'Invalid user or request' });
                        });
                }
            } else {
                res.status(200).send({ code: user.code, role: user.role });
            }
        } else {
            logger(LOG_TYPE.INFO, 'User not logged');
            userList.push({ id: req.session.id, resource: APP_BASE_URL + '/list', redirections: 0, checked: false });
            res.redirect(casBaseUrl + '/cai-cas/login?service=' + PARSED_URL);
        }
    }
})

authRoute.get('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect('/list');
});

authRoute.use(express.static(OUT_DIR));

authRoute.get('/*', function (req, res) {
    logger(LOG_TYPE.INFO, req.method + ' REQUEST: ' + JSON.stringify(req.query));
    logger(LOG_TYPE.INFO, req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');

    if (DISABLE_AUTH) {
        res.sendFile(path.join(OUT_DIR + '/index.html'));
    } else {
        const user = userList.find(obj => String(obj.id) === req.session.id);
        if (!user) {
            logger(LOG_TYPE.INFO, 'User not logged');
            userList.push({ id: req.session.id, resource: req.path, redirections: 0, checked: false });
            res.redirect(casBaseUrl + '/cai-cas/login?service=' + PARSED_URL);
        } else {
            if (user.ticket) {
                logger(LOG_TYPE.INFO, 'Checking ticket: ', user.ticket);
                validationPromise(user.ticket)
                    .then((usr) => {
                        logger(LOG_TYPE.INFO, 'Valid ticket');
                        user.checked = true;
                        user.redirections = 0;
                        if (!user.code || !user.role) {
                            user.uuid = usr;
                            checkUserPromise(usr)
                                .then(us => {
                                    logger(LOG_TYPE.INFO,
                                        'Access granted with role and code: ', Auth_Permissions.User_Type[us.role], us.code);
                                    user.code = us.code;
                                    user.role = us.role;

                                    res.sendFile(path.join(OUT_DIR + '/index.html'));
                                })
                                .catch(() => {
                                    logger(LOG_TYPE.INFO, 'Access denied');
                                    res.sendFile(path.join(OUT_DIR + '/index.html'));
                                });
                        } else {
                            if (user.role) {
                                logger(LOG_TYPE.INFO, 'Access granted with role and code: ', user.role, user.code);
                                res.sendFile(path.join(OUT_DIR + '/index.html'));
                            } else {
                                res.sendFile(path.join(OUT_DIR + '/index.html'));
                            }
                        }
                    })
                    .catch((err) => {
                        logger(LOG_TYPE.INFO, 'Invalid ticket', err);
                        user.redirections++;
                        user.checked = false;
                        user.resource = req.path;
                        if (user.redirections >= 3) {
                            const index = userList.findIndex(obj => String(obj.id) === user.id);
                            userList.splice(index, 1);
                            logger(LOG_TYPE.WARNING, 'Too many redirects');
                            res.status(500).send(`Error, try logout <a href='` +
                                casBaseUrl + '/cai-cas/logout' + `'>here</a> before try again.
                                <br>Error info:<br><br>` + err);
                        } else {
                            res.redirect(casBaseUrl + '/cai-cas/login?service=' + PARSED_URL);
                        }
                    });
            } else {
                logger(LOG_TYPE.WARNING, 'Invalid user ticket');
                user.resource = req.path;
                user.redirections++;
                if (user.redirections >= 3) {
                    logger(LOG_TYPE.WARNING, 'Too many redirects');
                    const index = userList.findIndex(obj => String(obj.id) === user.id);
                    userList.splice(index, 1);
                    res.status(500).send('Error, try logout <a href="' + casBaseUrl + '/cai-cas/logout' + '">here</a> before try again');
                } else {
                    res.redirect(casBaseUrl + '/cai-cas/login?service=' + PARSED_URL);
                }
            }
        }
    }
});
