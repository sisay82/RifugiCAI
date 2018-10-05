import * as url from 'url'
import { Request, Response } from 'express';
import { logger, LOG_TYPE } from '../../tools/common';
import * as xmldom from 'xmldom';
import { getChildByName, validationPromise, updateDefaultUserPrivileges } from './auth.logic';
import { ENV_CONFIG } from '../../config/env';

const DOMParser = xmldom.DOMParser;

export interface ICasOption {
    url: string;
    serviceUrl: string;
    renew?: boolean;
    isDevMode?: boolean;
    devModeUser?: string;
    destroySession?: boolean;
}

/**
     * The CAS authentication types.
     */
export enum AUTH_TYPE {
    BOUNCE = 0,
    BOUNCE_REDIRECT = 1,
    BLOCK = 2
};

const XMLParser = new DOMParser({
    locator: {},
    errorHandler: {
        warning: function (err) {
            logger(LOG_TYPE.ERROR, err);
        }
    }
});

export class CasAuth {
    private validateUri = '/serviceValidate';
    private url: string;
    private host: string;
    private port: number;
    private path: string;
    private serviceUrl: string;
    private renew: boolean;
    private isDevMode: boolean;
    private destroySession: boolean;

    constructor(options: ICasOption) {
        if (!options) {
            throw new Error('CAS Auth was not given a valid configuration object.');
        }
        if (options.url === undefined) {
            throw new Error('CAS Auth requires a url parameter.');
        }
        if (options.serviceUrl === undefined) {
            throw new Error('CAS Auth requires a service_url parameter.');
        }
        this.url = options.url;
        const parsedUrl = url.parse(options.url);
        this.host = parsedUrl.hostname;
        this.port = parsedUrl.protocol === 'http:' ? 80 : 443;
        this.path = parsedUrl.pathname;
        this.serviceUrl = options.serviceUrl
        this.renew = options.renew !== undefined ? !!options.renew : false;
        this.isDevMode = options.isDevMode !== undefined ? !!options.isDevMode : false;
        this.destroySession = options.destroySession !== undefined ? !!options.destroySession : false;
    }

    private validate(body, callback: (err: any, uuid?: string, attributes?: any) => void) {
        const el: Document = XMLParser.parseFromString(body, 'text/xml');
        if (el && getChildByName(el, 'authenticationSuccess')) {
            const user = getChildByName(el, 'uuid').textContent;
            return callback(null, user);
        } else {
            return callback(new Error('CAS auth failed'));
        }
    };

    private handle(req: Request, res: Response, next: any, authType: AUTH_TYPE) {
        if (authType === AUTH_TYPE.BOUNCE_REDIRECT) {
            if (req.session.ticket) {
                // If there is a CAS ticket in the query string, validate it with the CAS server.
                this._handleTicket(req, res, next);
            } else {
                this.login(req, res);
            }
        } else if (authType === AUTH_TYPE.BLOCK) {
            // If the authentication type is BLOCK, simply send a 401 response.
            if (req.session.checked) {
                next();
            } else {
                res.sendStatus(401);
            }
        } else if (authType === AUTH_TYPE.BOUNCE) {
            if (req.query && req.query.ticket) {
                req.session.ticket = req.query.ticket;
                res.redirect(req.session.resource);
            } else {
                this.login(req, res);
            }
        } else {
            // Otherwise, send not implemented error.
            res.sendStatus(501);
        }
    };

    public bounce(req: Request, res: Response, next) {
        // Handle the request with the bounce authorization type.
        this.handle(req, res, next, AUTH_TYPE.BOUNCE);
    };
    public bounceRedirect(req: Request, res: Response, next) {
        // Handle the request with the bounceRedirect authorization type.
        this.handle(req, res, next, AUTH_TYPE.BOUNCE_REDIRECT);
    };
    public block(req: Request, res: Response, next) {
        // Handle the request with the block authorization type.
        this.handle(req, res, next, AUTH_TYPE.BLOCK);
    };

    private login(req: Request, res: Response) {
        // Save the return URL in the session. If an explicit return URL is set as a
        // query parameter, use that. Otherwise, just use the URL from the request.
        req.session.resource = req.query ? req.query.returnTo || req.path : req.path;

        req.session.checked = false;

        // Redirect to the CAS login.
        res.redirect(this.serviceUrl);

    }

    public logout(req: Request, res: Response, next) {
        // Destroy the entire session if the option is set.
        if (this.destroySession) {
            req.session.destroy(function (err) {
                if (err) {
                    logger(LOG_TYPE.ERROR, err);
                }
                res.redirect(this.url + '/logout');
            });
        } else {
            res.redirect(this.url + '/logout');
        }
    }

    private getValidationURI(ticket) {
        return this.url + this.validateUri +
            "?service=" + ENV_CONFIG.getParsedURL() +
            "&ticket=" + ticket
    }

    /**
     * Handles the ticket generated by the CAS login requester and validates it with the CAS login acceptor.
     */
    private _handleTicket(req: Request, res: Response, next) {
        // qui la gestione del ticket
        const validationURI = this.getValidationURI(req.session.ticket);
        validationPromise(validationURI)
            .then(uuid => {
                req.session.uuid = uuid;
                return updateDefaultUserPrivileges(req.session)
            })
            .then(user => {
                next();
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, err);
                this.handleRedirects(req, res, next);
            });
    };

    private handleRedirects(req: Request, res: Response, next) {
        if (req.session.redirections >= 3) {
            logger(LOG_TYPE.ERROR, "REDIRECTS ERROR on SESSION: ", req.session);
            res.status(500).send({
                error: `Error, try logout <a href='` +
                    this.url + '/logout' + `'>here</a> before try again`
            });
        } else {
            req.session.redirections = req.session.redirections ? 0 : req.session.redirections++;
            this.login(req, res);
        }
    }

}
