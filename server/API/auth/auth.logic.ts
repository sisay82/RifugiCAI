
import { logger, performRequestGET, LOG_TYPE } from '../../tools/common';
import xmldom = require('xmldom');
const DOMParser = xmldom.DOMParser;
import { Tools } from '../../../src/app/shared/tools/common.tools';
import { Enums } from '../../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import { config } from '../../config/env';
import { UserData, UserDataTools } from './userData';

export const CAS_BASE_URL = 'https://accesso.cai.it';
export const AUTH_URL = 'https://services.cai.it/cai-integration-ws/secured/users/';
export const DISABLE_AUTH = false;

export function getUserData(sessionID: string): Promise<UserData> {
    return new Promise<UserData>((resolve, reject) => {
        if (DISABLE_AUTH) {
            const user: UserData = {
                sid: sessionID,
                redirections: 0,
                checked: true,
                code: '9999999',
                role: Auth_Permissions.User_Type.superUser
            };
            resolve(user);
        } else {
            UserDataTools.getUserData(sessionID)
                .then(user => {
                    if (user && user.checked && user.role && user.code) {
                        resolve(user);
                    } else {
                        reject({ error: 'Unauthorized User' });
                    }
                })
                .catch(err => {
                    reject(err);
                });

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
        } else if (checkInclude(data.aggregatedAuthorities,
            Auth_Permissions.getUserRolesByType[Auth_Permissions.User_Type.visualization], 'role')) {
            return Auth_Permissions.User_Type.visualization;
        } else if (checkInclude(data.aggregatedAuthorities,
            Auth_Permissions.getUserRolesByType[Auth_Permissions.User_Type.area], 'role')) {
            return Auth_Permissions.User_Type.area;
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
                return data.regionaleGroupCode;
            }
        }
    }
    return code;
}

function getUserPermissions(data): Tools.IUserProfile {
    let role = getRole(data);
    const code = getCode(role, data);
    if (role === Auth_Permissions.User_Type.regional && Tools.getCodeSection(code, Auth_Permissions.Codes.CodeNames.CODETYPE) === '93') {
        role = Auth_Permissions.User_Type.area;
    }
    return { role: role, code: code };
}

export function checkUserPromise(uuid): Promise<{ role: Auth_Permissions.User_Type, code: String }> {
    logger(LOG_TYPE.INFO, 'CHECKUSER');
    return new Promise<{ role: Auth_Permissions.User_Type, code: String }>((resolve, reject) => {
        if (DISABLE_AUTH) {
            resolve({ role: Auth_Permissions.User_Type.superUser, code: '9999999' });
        } else {
            performRequestGET(AUTH_URL + uuid + '/full', 'Basic YXBwcmlmdWdpQGNhaS5pdDpiZXN1Z1U3UjJHdWc=', 1000 * 10)
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

export function validationPromise(ticket): Promise<String> {
    return new Promise((resolve, reject) => {
        if (DISABLE_AUTH) {
            resolve(null)
        } else {
            const url = CAS_BASE_URL + '/cai-cas/serviceValidate?service=' + config.getParsedURL() + '&ticket=' + ticket
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
