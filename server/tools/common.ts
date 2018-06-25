import { IShelter, IService, IFile } from '../../src/app/shared/types/interfaces';
import { Types, Document } from 'mongoose';
import { Enums } from '../../src/app/shared/types/enums';
import { Tools } from '../../src/app/shared/tools/common.tools';
import Auth_Permissions = Enums.Auth_Permissions;
import request = require('request');
import { parse as parseCSV } from 'json2csv';

export interface IServiceExtended extends IService, Document {
    _id: String;
}

export interface IShelterExtended extends IShelter, Document {
    _id: String;
}

export interface IFileExtended extends IFile, Document {
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

export function removeShelterToUpdate(shelUpdate: UpdatingShelter) {
    ShelUpdate.splice(ShelUpdate.indexOf(shelUpdate), 1);
}

export function getShelterToUpdateById(id: String) {
    return ShelUpdate.find(shelter => String(shelter.shelter._id) === id);
}

export const ObjectId = Types.ObjectId;

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

function getAreaRegions(area): any {
    return Auth_Permissions.Regions_Area[Number(area)];
}

export function getUserDataFilters(user: UserData): Tools.ICodeInfo {
    if (user && user.code && user.role) {
        const sections: {} = {};
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

function concatPropNames(father: String, props: String[]): String[] {
    return props.map(prop => father + '.' + prop);
}

function getAllSchemaNames(obj: any): String[] {
    const names = [];
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] != null) {
            if (typeof obj[prop] === 'function') {
                names.push(prop);
            } else {
                if (obj[prop].type) {
                    if (obj[prop].type.obj) {
                        const subNames = getAllSchemaNames(obj[prop].type.obj);
                        names.push(
                            ...concatPropNames(prop, subNames)
                        );
                    } else {
                        names.push(prop);
                    }
                }
            }

        }
    }
    return names;
}

export function getCSVFields(obj): String[] {
    if (obj && obj.schema && obj.schema.obj) {
        const originalObjSchema = obj.schema.obj;
        return [...getAllSchemaNames(originalObjSchema)];
    }
    return null;
}

export function convertShelsToCSV(shelters: IShelterExtended[], f?): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        try {
            if (shelters.length > 0) {
                const shelter = shelters[0];
                const fields: any = f != null ? f : getCSVFields(shelter);
                const csv = parseCSV(shelters, { fields });
                resolve(csv);
            } else {
                reject();
            }
        } catch (e) {
            reject(e);
        }
    });
}

setInterval(cleanSheltersToUpdate, 1500);
