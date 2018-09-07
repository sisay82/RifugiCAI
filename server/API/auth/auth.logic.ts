
import { logger, performRequestGET, LOG_TYPE } from '../../tools/common';
import xmldom = require('xmldom');
const DOMParser = xmldom.DOMParser;
import { Tools } from '../../../src/app/shared/tools/common.tools';
import { Enums } from '../../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import { UserData, UserDataTools, UserDataExtended } from './userData';
import { DISABLE_AUTH, AUTH_URL, getValidationURL, CAS_LOGOUT_URL, MAX_DELAY_GET_REQUEST, getLoginURL } from '../../tools/constants';
import { Response, Request } from 'express';
import { ENV_CONFIG } from '../../config/env';
import { store } from '../../config/app';

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

export function sendDefaultError(res: Response, ...errors) {
    logger(LOG_TYPE.WARNING, errors);
    res.status(500).send(`Error, try logout <a href='` +
        CAS_LOGOUT_URL + `'>here</a> before try again`);
}

export function sendTicketError(req: Request, res: Response, user: UserData, disableUserCheck?) {
    logger(LOG_TYPE.INFO, 'Invalid ticket');
    handleRedirects(user, req.path, disableUserCheck)
        .then(() => {
            res.redirect(getLoginURL())
        })
        .catch(e => {
            sendDefaultError(res, e);
        });
}

export function getChildByName(node: Node, name: String): Node {
    if (node && name && node.hasChildNodes()) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes.item(i);
            if (childNode.localName === name) {
                return childNode;
            }
            if (childNode.hasChildNodes()) {
                const n = getChildByName(childNode, name);
                if (n) {
                    return n;
                }
            }
        }
    }
    return null;
}

export function checkInclude(source: any[], target: any[], attribute): boolean {
    if (source && target) {
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

export function getRole(data): Auth_Permissions.User_Type {
    if (data) {
        if (checkInclude(data.aggregatedAuthorities, Auth_Permissions.USER_TYPE_TO_ROLE[Auth_Permissions.User_Type.central], 'role')) {
            return Auth_Permissions.User_Type.central;
        } else if (checkInclude(data.userGroups, Auth_Permissions.USER_TYPE_TO_ROLE[Auth_Permissions.User_Type.regional], 'name')) {
            return Auth_Permissions.User_Type.regional;
        } else if (checkInclude(data.aggregatedAuthorities,
            Auth_Permissions.USER_TYPE_TO_ROLE[Auth_Permissions.User_Type.sectional], 'role')) {
            return Auth_Permissions.User_Type.sectional;
        } else if (checkInclude(data.aggregatedAuthorities,
            Auth_Permissions.USER_TYPE_TO_ROLE[Auth_Permissions.User_Type.visualization], 'role')) {
            return Auth_Permissions.User_Type.visualization;
        } else if (checkInclude(data.aggregatedAuthorities,
            Auth_Permissions.USER_TYPE_TO_ROLE[Auth_Permissions.User_Type.area], 'role')) {
            return Auth_Permissions.User_Type.area;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function getCode(type: Auth_Permissions.User_Type, data): String {
    let code = null;
    if (type && data) {
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

export function getUserPermissions(data): Tools.IUserProfile {
    let role = getRole(data);
    const code = getCode(role, data);
    if (role && code) {
        if (
            role === Auth_Permissions.User_Type.regional &&
            Tools.getCodeSection(code, Auth_Permissions.Codes.CodeNames.CODETYPE) === '93'
        ) {
            role = Auth_Permissions.User_Type.area;
        }
        return { role: role, code: code };
    }
    return { role: null, code: null };
}

export function checkUserAuthorizations(uuid): Promise<{ role: Auth_Permissions.User_Type, code: String }> {
    logger(LOG_TYPE.INFO, 'CHECKUSER');
    if (!uuid) {
        return Promise.reject('ERROR USER UUID');
    }
    return new Promise<{ role: Auth_Permissions.User_Type, code: String }>((resolve, reject) => {
        if (DISABLE_AUTH) {
            resolve({ role: Auth_Permissions.User_Type.superUser, code: '9999999' });
        } else {
            performRequestGET(AUTH_URL + uuid + '/full', process.env.USER_DATA_AUTH, MAX_DELAY_GET_REQUEST)
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
                        logger(LOG_TYPE.ERROR, e);
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
            const url = getValidationURL(ticket);
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
                    if (el && getChildByName(el, 'authenticationSuccess')) {
                        const user = getChildByName(el, 'uuid').textContent;
                        resolve(user);
                    } else {
                        reject('Authentication FAILED');
                    }
                })
                .catch(err => {
                    logger(LOG_TYPE.WARNING, err);
                    reject(err);
                });
        }
    });
}

export function checkUserCache(user: UserDataExtended, sessionID: string)
    : Promise<{ code: String; role: Enums.Auth_Permissions.User_Type }> {
    return new Promise<{ code: String; role: Enums.Auth_Permissions.User_Type }>((resolve, reject) => {
        if (user && user.uuid) {
            if (!user.code || !user.role) {
                deleteSessionByID(sessionID)
                    .then(() => {
                        reject('Permissions in UserData cache error');
                    })
                    .catch(err => {
                        logger(LOG_TYPE.ERROR, err);
                        reject('Permissions in UserData cache error');
                    });
            } else {
                resolve({ code: user.code, role: user.role })
            }
        } else {
            logger(LOG_TYPE.INFO, 'User not logged');
            UserDataTools.updateUserData(
                { sid: sessionID, resource: ENV_CONFIG.getAppBaseURL() + '/list', redirections: 0, checked: false }
            )
                .then(() => {
                    reject();
                })
                .catch(e => {
                    logger(LOG_TYPE.ERROR, 'Error deleting user data', e);
                    reject();
                });
        }
    });
}

export function deleteSessionByID(sessionID) {
    return new Promise<void>((resolve, reject) => {
        store.get(sessionID, (err, session) => {
            if (err) {
                reject(err);
            } else {
                return deleteSession(session);
            }
        });
    });
}

export function deleteSession(session) {
    return new Promise<void>((resolve, reject) => {
        session.destroy(e => {
            if (e) {
                reject(e);
            } else {
                resolve();
            }
        });
    });
}

export function handleRedirects(user: UserData, path: string, disableUserCheck?): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (user.redirections >= 3) {
            UserDataTools.deleteDataSession(user.sid)
                .then(() => {
                    reject("Redirection error: TOO MANY REDIRECTS")
                })
                .catch(err => {
                    logger(LOG_TYPE.ERROR, 'Error deleting user data', err);
                    reject("Redirection error: TOO MANY REDIRECTS")
                });
        } else {
            if (disableUserCheck) {
                user.checked = false;
            }
            user.resource = path;
            user.redirections++;
            UserDataTools.updateUserData(user)
                .then(userData => {
                    resolve();
                })
                .catch(err => {
                    reject(err)
                });
        }
    })

}

export function updateDefaultUserPrivileges(user: UserData): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        user.checked = true;
        user.redirections = 0;
        if (!user.code || !user.role) {
            checkUserAuthorizations(user.uuid)
                .then(us => {
                    logger(LOG_TYPE.INFO,
                        'Access granted with role and code: ', Auth_Permissions.User_Type[us.role], us.code);
                    user.code = us.code;
                    user.role = us.role;
                    UserDataTools.updateUserAndSend(
                        user,
                        () => resolve(),
                        (err) => reject(err)
                    );

                })
                .catch((err) => {
                    logger(LOG_TYPE.INFO, 'Access denied', err);
                    UserDataTools.updateUserAndSend(
                        user,
                        () => resolve(),
                        (e) => reject(e)
                    );
                });
        } else {
            logger(LOG_TYPE.INFO, 'Access granted with role and code: ', user.role, user.code);
            UserDataTools.updateUserAndSend(
                user,
                () => resolve(),
                (err) => reject(err)
            );
        }
    });
}
