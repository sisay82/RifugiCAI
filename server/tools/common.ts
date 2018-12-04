import { IShelter, IService, IFile } from '../../src/app/shared/types/interfaces';
import { Types, Document } from 'mongoose';
import { Enums } from '../../src/app/shared/types/enums';
import { Tools } from '../../src/app/shared/tools/common.tools';
import Auth_Permissions = Enums.Auth_Permissions;
import * as request from 'request';
import { Response } from 'express';
import { ENV_CONFIG } from '../config/env';

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

export function getRegExpListResult(arr: RegExp[], value) {
    let ret = false;
    arr.forEach(val => {
        ret = ret || val.test(value);
    });
    return ret;
}

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

export function getUserDataFilters(user): Tools.ICodeInfo {
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
    : Promise<{ response: request.Response, body: any }> {
    return new Promise<{ response: request.Response, body: any }>((resolve, reject) => {
        const headers = authorization ? { 'Authorization': authorization } : null;
        const time = Date.now();
        const req = request.get({
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
        req.on('error', (err) => {
            reject(err);
        });
        req.end();
    });
}

export enum LOG_TYPE {
    INFO,
    WARNING,
    ERROR
}

function structuredLog(logWeight: LOG_TYPE, logs: any[], error: boolean = false) {
    const log = {
        logWeight: logWeight,
        content: JSON.stringify(logs),
        time: Date.now(),
        _id: new ObjectId()
    }
    const logFunc = error ? console.error : console.log;
    ENV_CONFIG && ENV_CONFIG.DEV ? logFunc(log) : logFunc(JSON.stringify(log));
}

export function logger(logWeight: LOG_TYPE, log?: any, ...other) {
    if (logWeight === LOG_TYPE.ERROR) {
        structuredLog(logWeight, ['FATAL ERROR: ', log].concat(other), true);
    }
    if (!DISABLE_LOG) {
        if (logWeight === LOG_TYPE.WARNING) {
            structuredLog(logWeight, ['WARNING: ', log].concat(other));
        } else {
            structuredLog(logWeight, [log].concat(other));
        }
    }
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
