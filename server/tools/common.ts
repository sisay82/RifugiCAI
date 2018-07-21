import { IShelter, IService, IFile } from '../../src/app/shared/types/interfaces';
import { Types, Document, QueryCursor } from 'mongoose';
import { Enums } from '../../src/app/shared/types/enums';
import { Tools } from '../../src/app/shared/tools/common.tools';
import Auth_Permissions = Enums.Auth_Permissions;
import request = require('request');
import { CSV_FIELDS, CSV_UNWINDS, CSV_ALIASES } from './constants';
import { Response, json } from 'express';

import fastCsv = require('fast-csv');
import { DEFAULT_ENCODING } from 'crypto';

const Readable = require('stream').Readable;

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
                } else if (Array.isArray(obj[prop])) {
                    for (const p of obj[prop]) {
                        const subNames = getAllSchemaNames(p.obj);
                        names.push(
                            ...concatPropNames(prop, subNames)
                        );
                    }
                }
            }

        }
    }
    return names;
}

export function sendFile(res: Response, stream): Promise<any> {
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

export function getCSVFields(obj): String[] {
    if (obj && obj.schema && obj.schema.obj) {
        const originalObjSchema = obj.schema.obj;
        return [...getAllSchemaNames(originalObjSchema)];
    }
    return null;
}

export function trimStr(str: String, c): string {
    const start = str.startsWith(c) ? 1 : 0;
    const end = str[str.length - 1] === c ? str.length - 1 : str.length;
    return str.slice(start, end);
}

function getAliasForField(field: String, aliases) {
    const parts = field.split('\.');
    let current = aliases;
    for (const part of parts) {
        current = current[part];
        if (current) {
            if (typeof current === "string") {
                return current;
            }
        } else { return null; }
    }
    return null;
}

export function replaceCSVHeader(csvFile, fields) {
    const rows = csvFile.split('\n');
    const header = rows[0].slice(0, rows[0].length - 2);

    if (header && fields) {
        return header.split(',')
            .map(field => ('"' + getAliasForField(trimStr(field, '"'), fields) + '"') || field)
            .join(',') + "\n" + rows.join('\n');
    }
}


function flattenArray(arr) {
    return arr.reduce((acc, val, index) => {
        const uniqueKeyObj = Object.keys(val).reduce((o, k) => {
            o["k" + index + '.' + k] = val[k];
            return o;
        }, {});
        return Object.assign({}, acc, uniqueKeyObj);
    }, {})
}

export function getFieldNameFragment(fieldName: string): string[][] {
    const fields = CSV_FIELDS
        .filter(f => f.indexOf(fieldName) > -1)
        .map(f => {
            const parts = f.split('\.')
            const base = fieldName.split('\.');
            return parts.filter(p => !base.includes(p));
        })
    return fields
}

export function processServicesFields(services) {
    const ret = {};
    for (const cat of services) {
        // let tags = "";
        cat.tags.forEach(tag => {
            ret["services." + <string>cat.category + "." + tag.key] = tag.value;
            // tags += tag.key + ": " + tag.value + "|";
        });

        // ret[<string>cat.name] = tags;
    }
    return ret;
}

export function processArrayField(baseField, objs, useFields?) {
    const fields = useFields == null ? getFieldNameFragment(baseField) : useFields;

    return objs ? objs.reduce((acc, val, index) => {
        const uniqueKeyObj = fields.reduce((o, k) => {
            if (Array.isArray(k) && k.length !== 1) {
                o = k.reduce((a, subK) => {
                    const subfields = processArrayField(
                        baseField + index + '.' + subK, val[subK],
                        getFieldNameFragment(baseField + '.' + subK)
                    );
                    return Object.assign({}, a, subfields);
                }, o)
            } else {
                const key = Array.isArray(k) ? k[0] : k;
                o[baseField + index + '.' + key] = val[key];
            }

            return o;
        }, {});
        return Object.assign({}, acc, uniqueKeyObj);
    }, {}) : {}

}

export function getValueForFieldDoc(doc, field) {
    const parts = field.split('\.');
    let ret = doc;
    for (const part of parts) {
        if (ret[part] != null) {
            ret = ret[part];
        } else {
            return null;
        }
    }
    return ret;
}

export function getPropertySafe(obj, prop) {
    return prop
        .split('\.')
        .reduce((acc, val) => {
            return acc != null ? acc[val] || null : acc;
        }, obj);
}

function transform(doc: IShelterExtended) {
    const ret = {};

    for (const field of CSV_FIELDS) {
        const part = field.split('\.')[0];
        if (!CSV_UNWINDS.includes(part)) {
            const name = getAliasForField(field, CSV_ALIASES);
            const value = getValueForFieldDoc(doc, field);
            ret[name] = value;
        }
    }

    /*const fieldsUnwinded = CSV_UNWINDS.reduce((acc, val) => {
        const prop = getPropertySafe(doc, val);
        return prop != null ? Object.assign({}, acc, processArrayField(val, prop)) : acc;
    }, {})*/

    const managFields = doc.management ? processArrayField(
        "management.subject",
        doc.management.subject
    ) : {};

    const openingFields = doc.openingTime ? processArrayField(
        "openingTime",
        doc.openingTime
    ) : {};

    const servicesFields = doc.services ? processServicesFields(doc.services) : {}

    return Object.assign(
        {},
        ret,
        managFields,
        servicesFields,
        openingFields
    );
}

export function createCSV(shelters: IShelterExtended[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        try {
            let headers = {};
            const s = new Readable({ objectMode: true });
            s._read = function noop() { };
            for (const shelter of shelters) {
                headers = Object.assign({}, headers, transform(shelter));
                s.push(shelter);
            }
            s.push(null);

            const csvStream = fastCsv.createWriteStream({ headers: Object.keys(headers) })
                .transform(transform);

            const resStream = s.pipe(csvStream);

            let csv = "";
            resStream.on('data', chunk => {
                csv += chunk;
            });
            resStream.on('end', () => {
                resolve(csv);
            });
            resStream.on('error', err => {
                reject(err);
            });

        } catch (e) {
            reject(e);
        }

        /*cursor.pipe(csvStream).pipe(response);*/
    });
}

setInterval(cleanSheltersToUpdate, 1500);
