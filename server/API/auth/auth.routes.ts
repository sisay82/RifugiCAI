import { Enums } from '../../../src/app/shared/types/enums';
import * as express from 'express';
import Auth_Permissions = Enums.Auth_Permissions;
import { logger, LOG_TYPE, sendFatalError } from '../../tools/common';
import { OUT_DIR, DISABLE_AUTH, CAS_LOGOUT_URL, getLoginURL, CAS_BASE_URL } from '../../tools/constants';
import * as path from 'path';
import {
    checkUserCache
} from './auth.logic';
import { CasAuth, ICasOption, AUTH_TYPE } from './auth.cas';
import { ENV_CONFIG } from '../../config/env';

export const authRoute = express.Router();
const CasOptions: ICasOption = {
    url: CAS_BASE_URL,
    serviceUrl: ENV_CONFIG.getParsedURL()
}
const AuthService = new CasAuth(CasOptions);

authRoute.get('/logout', AuthService.logout.bind(AuthService));

authRoute.get('/j_spring_cas_security_check', function (req, res, next) {
    if (DISABLE_AUTH) {
        res.redirect('/list');
    } else {
        next();
    }
}, AuthService.bounce.bind(AuthService));

authRoute.get('/user', function (req, res) {
    if (DISABLE_AUTH) {
        res.status(200).send({ code: '9999999', role: Auth_Permissions.User_Type.superUser });
    } else {
        checkUserCache(req)
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
    if (DISABLE_AUTH) {
        res.sendFile(path.join(OUT_DIR + '/index.html'));
    } else {
        next();
    }
}, AuthService.bounceRedirect.bind(AuthService), function (req, res) {
    logger(LOG_TYPE.INFO, req.method + ' REQUEST: ' + JSON.stringify(req.query) + ' PATH: ' + req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.sendFile(path.join(OUT_DIR + '/index.html'));
});

