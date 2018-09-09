import { IShelter, IService, IFile } from '../../src/app/shared/types/interfaces';
import { Types, Document } from 'mongoose';
import { Enums } from '../../src/app/shared/types/enums';
import { Tools } from '../../src/app/shared/tools/common.tools';
import Auth_Permissions = Enums.Auth_Permissions;
import request = require('request');
import { Response } from 'express';
import { UserData } from '../API/auth/userData';

export interface IServiceExtended extends IService, Document {
    _id: String;
}

export interface IShelterExtended extends IShelter, Document {
    _id: String;
}

export interface IFileExtended extends IFile, Document {
    _id: String;
}

export const ObjectId = Types.ObjectId;

const DISABLE_LOG = false;
const TIMEOUT_REQUEST = 1000 * 2;

export function removeDuplicate(a: any[], b: any[]): any[] {
    let t;
    if (b.length > a.length) {
        t = b, b = a, a = t;
    }
    return a.filter(function (e) {
        return b.indexOf(e) === -1;
    });
}

export function intersectArray(a: any[], b: any[]): any[] {
    let t;
    if (b.length > a.length) {
        t = b, b = a, a = t;
    }
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}

export function getUserDataFilters(user: UserData): Tools.ICodeInfo {
    if (user && user.code && user.role) {
        if (Auth_Permissions.User_Type[user.role]) {
            return Tools.getCodeSections(user.role, user.code);
        } else {
            return null;

        }
    } else {
        return null;
    }
}

export function performRequestGET(url: String, authorization?: String, timeout: number = TIMEOUT_REQUEST, count: number = 0)
    : Promise<{ response: any, body: any }> {
    return new Promise<{ response: any, body: any }>((resolve, reject) => {
        const headers = authorization ? { 'Authorization': authorization } : null;
        const time = Date.now();
        request.get({
            url: <string>url,
            method: 'GET',
            headers: headers,
            timeout: timeout
        }, function (err, response, body) {
            if (err) {
                if (String(err.code) === 'ESOCKETTIMEDOUT' && count < 3) {
                    logger(LOG_TYPE.WARNING, 'RETRY REQUEST ' + count, Date.now() - time);
                    return performRequestGET(url, authorization, timeout, ++count);
                } else {
                    reject(err);
                }
            } else {
                resolve({ response: response, body: body });
            }
        });
    });
}

export enum LOG_TYPE {
    INFO,
    WARNING,
    ERROR
}

export function logger(logWeight: LOG_TYPE, log?: any, ...other) {
    if (logWeight === LOG_TYPE.ERROR) {
        console.error('FATAL ERROR: ', log, ...other);
    }
    if (!DISABLE_LOG) {
        if (logWeight === LOG_TYPE.WARNING) {
            console.log('WARNING: ', log, ...other);
        } else {
            console.log(log, ...other);
        }
    }
}

export function sendFatalError(res, ...errors) {
    if (errors) { logger(LOG_TYPE.ERROR, errors) };
    res.status(500).send({ error: 'Invalid user or request' });
}

export function toTitleCase(input: string): string {
    if (!input) {
        return '';
    } else {
        return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1))).replace(/_/g, ' ');
    }
}

export function getPropertiesNumber(obj): number {
    let c = 0;
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            ++c;
        }
    }
    return c;
}

export function sendFileStream(res: Response, stream): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        stream.on('error', (err) => {
            reject();
        })
        stream.on('data', (chunk) => {
            res.send(chunk);
        });
        stream.on('end', () => {
            resolve();
        });
    })
}

export function getPropertySafe(obj, prop) {
    return prop
        .split('\.')
        .reduce((acc, val) => {
            return acc != null ? acc[val] || null : acc;
        }, obj);
}
