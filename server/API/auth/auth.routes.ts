import { Enums } from '../../../src/app/shared/types/enums';
import * as express from 'express';
import Auth_Permissions = Enums.Auth_Permissions;
import { logger, LOG_TYPE, sendFatalError } from '../../tools/common';
import { OUT_DIR, DISABLE_AUTH, CAS_LOGOUT_URL, getLoginURL } from '../../tools/constants';
import { ENV_CONFIG } from '../../config/env';
import * as path from 'path';
import {
    validationPromise,
    sendDefaultError,
    checkUserCache,
    deleteSession,
    updateDefaultUserPrivileges,
    sendTicketError
} from './auth.logic';
import { UserDataTools, UserData } from './userData';

export const authRoute = express.Router();

authRoute.get('/logout', function (req, res) {
    if (DISABLE_AUTH) {
        res.redirect('/list');
    } else {
        const sid = req.session.id;
        deleteSession(req.session)
            .then(() => {
                logger(LOG_TYPE.INFO, 'Logging out user ' + sid);
                res.redirect(CAS_LOGOUT_URL);
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, 'Error in destroying session', err);
                res.redirect(CAS_LOGOUT_URL);
            });
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
                    (err) => sendFatalError(res, err)
                );
            })
            .catch(err => {
                logger(LOG_TYPE.WARNING, 'Invalid user request', err);
                UserDataTools.updateUserAndSend(
                    { sid: req.session.id, resource: ENV_CONFIG.getAppBaseURL(), redirections: 0, checked: false },
                    () => res.redirect(getLoginURL()),
                    (e) => sendFatalError(res, e)
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
                return checkUserCache(user, req.session.id);
            })
            .then((user) => {
                res.status(200).send({ code: user.code, role: user.role })
            })
            .catch((err) => {
                if (err) {
                    sendFatalError(err);
                } else {
                    res.redirect(getLoginURL());
                }
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

authRoute.get('/*', function (req, res, next) {
    logger(LOG_TYPE.INFO, req.method + ' REQUEST: ' + JSON.stringify(req.query) + ' PATH: ' + req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    if (DISABLE_AUTH) {
        res.sendFile(path.join(OUT_DIR + '/index.html'));
    } else {
        next();
    }
}, function (req, res, next) {
    UserDataTools.getUserData(req.session.id)
        .then(user => {
            req.body.user = user;
            next();
        })
        .catch(err => {
            logger(LOG_TYPE.INFO, 'User not logged', err);
            UserDataTools.updateUserAndSend(
                { sid: req.session.id, resource: req.path, redirections: 0, checked: false },
                () => res.redirect(getLoginURL()),
                (e) => sendFatalError(res, e)
            );
        });
}, function (req, res) {
    const user = req.body.user;
    if (user.ticket) {
        logger(LOG_TYPE.INFO, 'Checking ticket: ', user.ticket);
        validationPromise(user.ticket)
            .then((uuid) => {
                logger(LOG_TYPE.INFO, 'Valid ticket');
                user.uuid = uuid;
                updateDefaultUserPrivileges(user)
                    .then(() => {
                        res.sendFile(path.join(OUT_DIR + '/index.html'));
                    })
                    .catch(err => {
                        sendDefaultError(res, err);
                    });
            })
            .catch((err) => {
                if (err) {
                    logger(LOG_TYPE.WARNING, err);
                }
                sendTicketError(req, res, user, true);
            });
    } else {
        sendTicketError(req, res, user);
    }
});
