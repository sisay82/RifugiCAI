import { Enums } from '../../../src/app/shared/types/enums';
import * as express from 'express';
import Auth_Permissions = Enums.Auth_Permissions;
import { logger, LOG_TYPE } from '../../tools/common';
import { OUT_DIR } from '../../tools/constants';
import { config } from '../../config/env';
import * as path from 'path';
import { DISABLE_AUTH, CAS_BASE_URL, checkUserPromise, validationPromise } from './auth.logic';
import { UserDataTools, UserData } from './userData';

export const authRoute = express.Router();

function sendDefaultError(res: express.Response, err?) {
    res.status(500).send(`Error, try logout <a href='` +
        CAS_BASE_URL + '/cai-cas/logout' + `'>here</a> before try again.
            <br>Error info:<br><br>` + err);
}

authRoute.get('/logout', function (req, res) {
    if (DISABLE_AUTH) {
        res.redirect('/list');
    } else {
        logger(LOG_TYPE.INFO, 'Logging out user ' + req.session.id);
        req.session.destroy(err => {
            if (err) {
                logger(LOG_TYPE.WARNING, 'Error in destroying session', err);
            }
        })
        res.redirect(CAS_BASE_URL + '/cai-cas/logout');
    }
});

authRoute.get('/j_spring_cas_security_check', function (req, res) {
    if (DISABLE_AUTH) {
        res.redirect('/list');
    } else {
        UserDataTools.getUserData(req.session.id)
            .then(user => {
                user.ticket = req.query.ticket;
                UserDataTools.updateUserAndSend(
                    user,
                    (updUser) => res.redirect(updUser.resource.toString()),
                    () => sendDefaultError(res)
                );
            })
            .catch(err => {
                logger(LOG_TYPE.WARNING, 'Invalid user request');
                UserDataTools.updateUserAndSend(
                    { sid: req.session.id, resource: config.getAppBaseURL(), redirections: 0, checked: false },
                    () => res.redirect(CAS_BASE_URL + '/cai-cas/login?service=' + config.getParsedURL()),
                    () => sendDefaultError(res)
                );
            })

    }
});

authRoute.get('/user', function (req, res) {
    if (DISABLE_AUTH) {
        res.status(200).send({ code: '9999999', role: Auth_Permissions.User_Type.superUser });
    } else {
        UserDataTools.getUserData(req.session.id)
            .then(user => {
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
                                    UserDataTools.updateUserAndSend(
                                        user,
                                        () => res.status(200).send(usr),
                                        () => sendDefaultError(res)
                                    );
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
                    UserDataTools.updateUserData(
                        { sid: req.session.id, resource: config.getAppBaseURL() + '/list', redirections: 0, checked: false }
                    )
                        .then(() => {
                            res.redirect(CAS_BASE_URL + '/cai-cas/login?service=' + config.getParsedURL());
                        })
                        .catch(e => {
                            logger(LOG_TYPE.ERROR, 'Error deleting user data', e);
                        });
                }
            })
            .catch(() => {
                res.status(500).send({ error: 'Invalid user or request' });
            });
    }
})

authRoute.get('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect('/list');
});

authRoute.use(express.static(OUT_DIR));

function handleRedirects(user: UserData, res: express.Response, req: express.Request, error?) {
    user.resource = req.path;
    user.redirections++;
    if (user.redirections >= 3) {
        logger(LOG_TYPE.WARNING, 'Too many redirects');
        UserDataTools.deleteDataSession(user.sid)
            .then(() => {
                res.status(500).send(`Error, try logout <a href='` +
                    CAS_BASE_URL + '/cai-cas/logout' + `'>here</a> before try again.
                                        <br>Error info:<br><br>` + error);
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, 'Error deleting user data', err);
                res.status(500).send(
                    'Error, try logout <a href="' + CAS_BASE_URL + '/cai-cas/logout' + '">here</a> before try again'
                );
            })
    } else {
        res.redirect(CAS_BASE_URL + '/cai-cas/login?service=' + config.getParsedURL());
    }
}

/*
authRoute.get('/*', function (req, res, next) {

});
*/

authRoute.get('/*', function (req, res) {
    logger(LOG_TYPE.INFO, req.method + ' REQUEST: ' + JSON.stringify(req.query));
    logger(LOG_TYPE.INFO, req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');

    if (DISABLE_AUTH) {
        res.sendFile(path.join(OUT_DIR + '/index.html'));
    } else {
        UserDataTools.getUserData(req.session.id)
            .then(user => {
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
                                        UserDataTools.updateUserAndSend(
                                            user,
                                            () => res.sendFile(path.join(OUT_DIR + '/index.html')),
                                            () => sendDefaultError(res)
                                        );
                                    })
                                    .catch(() => {
                                        logger(LOG_TYPE.INFO, 'Access denied');
                                        UserDataTools.updateUserAndSend(
                                            user,
                                            () => res.sendFile(path.join(OUT_DIR + '/index.html')),
                                            () => sendDefaultError(res)
                                        );
                                    });
                            } else {
                                if (user.role) {
                                    logger(LOG_TYPE.INFO, 'Access granted with role and code: ', user.role, user.code);
                                }
                                UserDataTools.updateUserAndSend(
                                    user,
                                    () => res.sendFile(path.join(OUT_DIR + '/index.html')),
                                    () => sendDefaultError(res)
                                );
                            }
                        })
                        .catch((err) => {
                            logger(LOG_TYPE.INFO, 'Invalid ticket', err);
                            if (user.redirections >= 3) {
                                UserDataTools.deleteDataSession(user.sid)
                                    .then(() => {
                                        logger(LOG_TYPE.WARNING, 'Too many redirects');
                                        sendDefaultError(res, err);
                                        res.status(500).send(`Error, try logout <a href='` +
                                            CAS_BASE_URL + '/cai-cas/logout' + `'>here</a> before try again.
                                        <br>Error info:<br><br>` + err);
                                    })
                                    .catch(e => {
                                        logger(LOG_TYPE.ERROR, 'Error deleting user data', e);
                                        sendDefaultError(res);
                                    })
                            } else {
                                user.redirections++;
                                user.checked = false;
                                user.resource = req.path;
                                UserDataTools.updateUserAndSend(
                                    user,
                                    () => res.redirect(CAS_BASE_URL + '/cai-cas/login?service=' + config.getParsedURL()),
                                    () => sendDefaultError(res)
                                );
                            }
                        });
                } else {
                    logger(LOG_TYPE.WARNING, 'Invalid user ticket');
                    if (user.redirections >= 3) {
                        logger(LOG_TYPE.WARNING, 'Too many redirects');
                        UserDataTools.deleteDataSession(user.sid)
                            .then(() => {
                                res.status(500).send(
                                    'Error, try logout <a href="' + CAS_BASE_URL + '/cai-cas/logout' + '">here</a> before try again'
                                );
                            })
                            .catch(err => {
                                logger(LOG_TYPE.ERROR, 'Error deleting user data', err);
                                res.status(500).send(
                                    'Error, try logout <a href="' + CAS_BASE_URL + '/cai-cas/logout' + '">here</a> before try again'
                                );
                            })
                    } else {
                        user.resource = req.path;
                        user.redirections++;
                        UserDataTools.updateUserAndSend(
                            user,
                            () => res.redirect(CAS_BASE_URL + '/cai-cas/login?service=' + config.getParsedURL()),
                            () => sendDefaultError(res)
                        );
                    }
                }
            })
            .catch(err => {
                logger(LOG_TYPE.INFO, 'User not logged', err);
                UserDataTools.updateUserData({ sid: req.session.id, resource: req.path, redirections: 0, checked: false })
                    .then(userData => {
                        res.redirect(CAS_BASE_URL + '/cai-cas/login?service=' + config.getParsedURL());
                    })
                    .catch(e => {
                        logger(LOG_TYPE.ERROR, 'Error deleting user data', e);
                        sendDefaultError(res);
                    });
            });
    }
});
