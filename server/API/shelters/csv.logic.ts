import { CSV_FIELDS, CSV_UNWINDS, CSV_ALIASES, CSV_UNWINDS_ALIASES } from '../../tools/constants';
import { IShelterExtended, toTitleCase, getPropertySafe } from '../../tools/common';

const FIELD_SEPARATOR = '->';
const CSV_SEPARATOR = '$';
const CSV_ENCAPSULE_CHAR = '"';

export function getAliasForPartialField(field: String, aliases = CSV_ALIASES) {
    const parts = field.split('\.');
    return parts.reduce((acc, val) => {
        return acc && acc[val] ? acc[val] : null;
    }, aliases);

}

export function getAliasForField(field: String, aliases = CSV_ALIASES) {
    const parts = field.split('\.');
    const partial = getAliasForPartialField(field, aliases);
    if (typeof partial === 'string') {
        return partial;
    } else {
        return partial ? partial[parts[parts.length - 1]] : null;
    }
}

export function getFieldNameLastFragment(fieldName: string): string[][] {
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
        cat.tags.forEach(tag => {
            ret["services." + <string>cat.category + "." + tag.key] = tag.value;
        });
    }
    return ret;
}

export function getSubfieldAliases(doc, aliases: {[key: string]: string}[]) {
    return Object.keys(aliases).reduce((acc, val) => {
        const name = aliases[val];
        const value = getPropertySafe(doc, val);

        if (name) {
            acc[name] = value;
        }
    
        return acc;
    }, {});
}

export function processArrayField(baseField, objs, useFields?) {
    const fields = useFields == null ? getFieldNameLastFragment(baseField) : useFields;

    return objs ? objs.reduce((acc, val, index) => {
        const uniqueKeyObj = fields.reduce((o, k) => {
            if (Array.isArray(k) && k.length !== 1) {
                o = k.reduce((a, subK) => {
                    let subfields = {};

                    if(val[subK]){
                        if (!Array.isArray(val[subK])) {
                            subfields = getSubfieldAliases(
                                val[subK],
                                getPropertySafe(CSV_UNWINDS_ALIASES, baseField + '.' + subK)
                            );
                        } else {
                            subfields = processArrayField(
                                baseField + index + '.' + subK, val[subK],
                                getFieldNameLastFragment(baseField + '.' + subK)
                            );
                        }
                    }
                    
                    return Object.assign({}, a, subfields);
                }, o)
            } else {
                const key = Array.isArray(k) ? k[0] : k;
                if (val[key] != null && typeof(val[key]) === "object") {
                    if (Object.keys(val[key]).length > 0) {
                        for (const prop in val[key]) {
                            o[baseField + index + '.' + prop] = val[key][prop];
                        }
                    } else {
                        o[baseField + index + '.' + key] = val[key];
                    }
                }else{
                    o[baseField + index + '.' + key] = val[key];
                }
            }

            return o;
        }, {});
        return Object.assign({}, acc, uniqueKeyObj);
    }, {}) : {}

}

export function processFlatArrayNames(obj: { [key: string]: any }, nameBase: string) {
    const names: string[] = CSV_UNWINDS[nameBase]
    const regMatch = /[0-9]+/g
    return Object.keys(obj).reduce((acc, val) => {
        const fragments = val.split('\.');
        const base = fragments.reduce((a, v, index) => {
            let ret = "";
            if (names[index]) {
                ret += names[index] + v.match(regMatch).join('') + ' ' + FIELD_SEPARATOR + ' ';
            }
            return a + ret
        }, "");
        const fieldNames = CSV_UNWINDS_ALIASES[nameBase];
        const n = fieldNames[fragments[fragments.length - 1]] ? base + fieldNames[fragments[fragments.length - 1]] : "";
        if (n) {
            acc[n] = obj[val];
        }
        return acc;
    }, {});
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

export function transformArrayFields(doc, baseField) {
    let fields = null;
    if (baseField === "services") {
        fields = processServicesFields(doc.services);
    } else {
        const prop = getPropertySafe(doc, baseField);
        if (!prop) {
            return null;
        }
        fields = processArrayField(baseField, prop);
    }
    return processFlatArrayNames(fields, baseField);
}

export function transform(doc: IShelterExtended): { [key: string]: any } {
    const ret = {};

    for (const field of CSV_FIELDS) {
        const part = field.split('\.')[0];
        if (!CSV_UNWINDS[part]) {
            const name = getAliasForField(field);
            const value = getValueForFieldDoc(doc, field);
            if (name) {
                ret[name] = value;
            }
        }
    }
    return Object.keys(CSV_UNWINDS).reduce((acc, val) => {
        return Object.assign({}, acc, transformArrayFields(doc, val))
    }, ret);
}

export function getCSVDict(shelters: IShelterExtended[]): { [key: string]: [any] } {
    return shelters.reduce((acc, val, index) => {
        const shel = transform(val);
        Object.keys(shel).forEach((v) => {
            if (!acc[v]) {
                acc[v] = <any>[]
            }
            acc[v][index] = shel[v]
        });
        Object.keys(acc)
            .filter(k => !Object.keys(shel).includes(k))
            .map(v => {
                if (acc[v]) {
                    acc[v].push(null);
                }
            });
        return acc;
    }, <{ [key: string]: [any] }>{});
}

export function getCSVLines(dict: { [key: string]: [any] }) {
    return Object.keys(dict).reduce((acc, val) => dict[val].length > acc ? dict[val].length : acc, 0)
}


export function getCSVAliasesOrdered() {
    const unwinds = Object.keys(CSV_UNWINDS);
    return CSV_FIELDS.reduce((acc, val) => {
        const arrField = unwinds.find(v => val.indexOf(v) >= 0);
        if (arrField) {
            const vals: any[] = Object.values(CSV_UNWINDS_ALIASES[arrField]);
            if (acc.findIndex(v => {
                const fieldName = CSV_UNWINDS[arrField].length > 0 ? v.slice(FIELD_SEPARATOR.length + 1) : v;
                return vals.indexOf(fieldName) >= 0;
            }) < 0) {
                acc = acc.concat(vals.map(v => {
                    return CSV_UNWINDS[arrField].length > 0 ? FIELD_SEPARATOR + ' ' + v : v;
                }));
            }
        }
        const objField = getAliasForPartialField(val);
        if (objField) {
            if (typeof objField === "string" && !acc.includes(objField)) {
                acc.push(objField);
            } else {
                const vals: any[] = Object.values(objField)
                if (acc.findIndex(v => vals.includes(v)) < 0) {
                    acc = acc.concat(vals);
                }
            }
        }
        return acc;
    }, <string[]>[])
}

export function parseCSVLines(dict) {
    const lines = getCSVLines(dict)
    return getCSVAliasesOrdered().reduce((acc, current) => {
        let val = [current];
        if (current.startsWith(FIELD_SEPARATOR)) {
            val = Object.keys(dict).filter(k => k.includes(current));
        }
        if (val) {
            val.map(dictVal => {
                if (dict[dictVal]) {
                    acc.header += CSV_ENCAPSULE_CHAR + dictVal + CSV_ENCAPSULE_CHAR;
                    for (let index = 0; index < lines; index++) {

                        let v = dict[dictVal][index];
                        if (!acc.lines[index]) {
                            acc.lines[index] = ""
                        }
                        if (v) {
                            if (typeof v === 'object' && !isNaN(new Date(v).getTime())) {
                                v = new Date(v).toISOString()
                            }
                            acc.lines[index] += CSV_ENCAPSULE_CHAR + String(v) + CSV_ENCAPSULE_CHAR;
                        }
                        acc.lines[index] += CSV_SEPARATOR
                    }
                    acc.header += CSV_SEPARATOR
                }
            })
        }
        return acc;
    }, { header: "", lines: <string[]>[] });
}

export function createCSV(shelters: IShelterExtended[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        try {
            const dict = getCSVDict(shelters);
            const partialCSV = parseCSVLines(dict);

            partialCSV.header = partialCSV.header.slice(0, partialCSV.header.length - 1)
            partialCSV.lines = partialCSV.lines.map(v => v.slice(0, v.length - 1));

            const csv = partialCSV.header + '\n' + partialCSV.lines.join('\n');
            resolve(csv);
        } catch (e) {
            reject(e);
        }
    });
}
