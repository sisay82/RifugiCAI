import { IShelter, IService, IFile } from '../../src/app/shared/types/interfaces';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { Enums } from '../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import request = require('request');

export interface IServiceExtended extends IService, mongoose.Document {
    _id: String;
}

export interface IShelterExtended extends IShelter, mongoose.Document {
    _id: String;
}

export interface IFileExtended extends IFile, mongoose.Document {
    _id: String;
}

export interface UpdatingShelter {
    watchDog: Date;
    shelter: IShelterExtended;
    files: any[];
    isNew?: Boolean;
}

export interface UserData {
    id: String;
    resource?: String;
    ticket?: String;
    uuid?: String;
    code?: String;
    role?: Auth_Permissions.User_Type;
    redirections: number;
    checked: boolean;
}

const ShelUpdate: UpdatingShelter[] = [];
export const SheltersToUpdate = new Proxy(ShelUpdate, {
    get(target, name) { return target[name] }
});

export const ObjectId = mongoose.Types.ObjectId;

const DISABLE_LOG = false;
const MAX_TIME = 1000 * 60 * 10;
const TIMEOUT_REQUEST = 1000 * 2;

function cleanSheltersToUpdate() {
    ShelUpdate.forEach(obj => {
        const diff = Date.now() - obj.watchDog.valueOf();
        if (diff > MAX_TIME) {
            ShelUpdate.splice(ShelUpdate.indexOf(obj), 1);
        }
    });
}

export function addShelterToUpdate(updatingShelter: UpdatingShelter, user: UserData): boolean {
    if (!user || !user.role) {
        return false;
    }

    updatingShelter.shelter.updateSubject = <any>Enums.Auth_Permissions.UserTypeName[user.role];
    updatingShelter.watchDog = new Date(Date.now());

    ShelUpdate.push(updatingShelter);
    return true;
}

function getAreaRegions(area: string): any {
    return Auth_Permissions.Regions_Area[Number(area)];
}

function getCodeSection(code: String, codeSection: Auth_Permissions.Codes.CodeSection): String {
    return code.substr(codeSection[0], codeSection[1]);
}

export function getShelterFilter(type?: Auth_Permissions.User_Type): (code: String) => String {
    if (type) {
        const codeSections: Auth_Permissions.Codes.CodeSection[] = Auth_Permissions.Codes.UserTypeCodes[type];
        return (code: String) => {
            return codeSections.reduce((value, codeSection) => value.concat(<string>getCodeSection(code, codeSection)), '');
        }
    } else {
        return function (code) {
            return null
        };
    }
}

export function getUserDataFilters(user: UserData): {} {
    if (user && user.code && user.role) {
        const sections: {} = {};
        if (Auth_Permissions.User_Type[user.role]) {
            const codeSections: Auth_Permissions.Codes.CodeSection[] = Auth_Permissions.Codes.UserTypeCodes[user.role];

            if (user.role === Auth_Permissions.User_Type.area) {
                sections["REGION"] = getAreaRegions(<string>getCodeSection(user.code, Auth_Permissions.Codes.CodeSection.REGION));
            } else {
                for (const codeSection of codeSections) {
                    const section = Auth_Permissions.Codes.CodeSection[codeSection];
                    const csection = getCodeSection(user.code, codeSection);
                    sections[section] = [csection];
                }
            }
            return sections;
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
            url: url,
            method: 'GET',
            headers: headers,
            timeout: timeout
        }, function (err, response, body) {
            if (err) {
                if (String(err.code) === 'ESOCKETTIMEDOUT' && count < 3) {
                    logger(LOG_TYPE.WARNING, 'RETRY REQUEST ' + count, Date.now() - time);
                    return performRequestGET(url, authorization, timeout, ++count)
                        .then(value => resolve(value))
                        .catch(e => reject(e));
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
        console.log('FATAL ERROR: ', log, ...other);
    }
    if (!DISABLE_LOG) {
        if (logWeight === LOG_TYPE.WARNING) {
            console.log('WARNING: ', log, ...other);
        } else {
            console.log(log, ...other);
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

setInterval(cleanSheltersToUpdate, 1500);
