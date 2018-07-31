import { CSV_FIELDS, CSV_UNWINDS, CSV_ALIASES, CSV_UNWINDS_ALIASES } from '../../tools/constants';
import { IShelterExtended, toTitleCase, getPropertySafe } from '../../tools/common';

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
    const fields = useFields == null ? getFieldNameLastFragment(baseField) : useFields;

    return objs ? objs.reduce((acc, val, index) => {
        const uniqueKeyObj = fields.reduce((o, k) => {
            if (Array.isArray(k) && k.length !== 1) {
                o = k.reduce((a, subK) => {
                    const subfields = processArrayField(
                        baseField + index + '.' + subK, val[subK],
                        getFieldNameLastFragment(baseField + '.' + subK)
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

export function processFlatArrayNames(obj: { [key: string]: any }, nameBase: string) {
    const names: string[] = CSV_UNWINDS[nameBase]
    const regMatch = /[0-9]+/g
    return Object.keys(obj).reduce((acc, val) => {
        const fragments = val.split('\.');
        const base = fragments.reduce((a, v, index) => {
            let ret = "";
            if (names[index]) {
                ret += names[index] + v.match(regMatch).join('') + ' -> ';
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
            const name = getAliasForField(field, CSV_ALIASES);
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

export function parseCSVLines(dict) {
    const lines = getCSVLines(dict)
    return Object.keys(dict).reduce((acc, val) => {
        acc.header += val;
        for (let index = 0; index < lines; index++) {
            let v = dict[val][index];
            if (!acc.lines[index]) {
                acc.lines[index] = ""
            }
            if (v) {
                if (typeof v === 'object' && !isNaN(new Date(v).getTime())) {
                    v = new Date(v).toISOString()
                }
                acc.lines[index] += String(v);
            }
            acc.lines[index] += ","
        }
        acc.header += ","
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
