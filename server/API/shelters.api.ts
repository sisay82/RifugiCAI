
import * as express from 'express';
import { Enums } from '../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import {
    addShelterToUpdate,
    IShelterExtended,
    IServiceExtended,
    removeShelterToUpdate,
    getShelterToUpdateById
} from '../tools/common';
import { model } from 'mongoose';
import { IOpening } from '../../src/app/shared/types/interfaces';
import { BCSchema } from '../../src/app/shared/types/schema';
import {
    UserData,
    getUserDataFilters,
    logger,
    LOG_TYPE,
    toTitleCase,
    ObjectId,
    getPropertiesNumber,
    UpdatingShelter
} from '../tools/common';
import { DISABLE_AUTH } from './auth.api';
import { createContributionPDF } from './pdf.api';
import { resolveFilesForShelter } from './files.api';
import { Tools } from '../../src/app/shared/tools/common.tools';

const Services = model<IServiceExtended>('Services', BCSchema.serviceSchema);
const Shelters = model<IShelterExtended>('Shelters', BCSchema.shelterSchema);

function getRegionFilter(region: String) {
    if (region && String(region).length === 2) {
        const regionQuery = { 'idCai': new RegExp('^[0-9-]{2,2}' + String(region) + '[0-9-]{4,6}') };
        return regionQuery;
    } else {
        return null;
    }
}

function getSectionFilter(section: String) {
    if (section && section.length === 3) {
        const sectionQuery = { 'idCai': new RegExp('^[0-9-]{4,4}' + section + '[0-9-]{1,3}') };
        return sectionQuery;
    } else {
        return null;
    }
}

function getQueryFilters(regions, sections) {
    const query: any = {};
    if ((regions && regions.length > 0) || (sections && sections.length > 0)) {
        query.$and = [];
        query.$and.push({ idCai: { '$ne': null } });

        let subQuery: any = {};
        if (regions) {
            for (const region of regions) {
                const regionFilter = getRegionFilter(region);
                if (regionFilter) {
                    if (!subQuery.$or) { subQuery.$or = []; }
                    subQuery.$or.push(regionFilter);
                }
            }
            query.$and.push(subQuery);
            subQuery = {};
        }

        if (sections) {
            for (const section of sections) {
                const sectionFilter = getSectionFilter(section);
                if (sectionFilter) {
                    if (!subQuery.$or) { subQuery.$or = []; }
                    subQuery.$or.push(sectionFilter);
                }
            }
            query.$and.push(subQuery);
        }
    }
    return query;
}

function getAllIdsHead(userData: Tools.ICodeInfo): Promise<IShelterExtended[]> {
    const regions = Tools.getRegions(userData);
    const sections = Tools.getSections(userData);
    const query = getQueryFilters(regions, sections);

    return new Promise<IShelterExtended[]>((resolve, reject) => {
        Shelters.find(query,
            'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality')
            .exec((err, ris) => {
                if (err) {
                    logger(LOG_TYPE.WARNING, err);
                    reject(err);
                } else {
                    resolve(ris);
                }
            });
    });
}

function queryShelPage(pageNumber, pageSize): Promise<IShelterExtended[]> {
    return new Promise<IShelterExtended[]>((resolve, reject) => {
        Shelters.find({}, 'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality')
            .skip(Number(pageNumber * pageSize)).limit(Number(pageSize)).exec((err, ris) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ris);
                }
            });
    });
}

function queryShelById(id): Promise<IShelterExtended> {
    return new Promise<IShelterExtended>((resolve, reject) => {
        Shelters.findById(id).populate('services').exec((err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        });
    });
}

function queryShelSectionById(id, section): Promise<IShelterExtended> {
    return new Promise<IShelterExtended>((resolve, reject) => {
        const query = Shelters.findOne({ _id: id }, 'name ' + section)
        if (section.indexOf('services') > -1) {
            query.populate('services');
        }
        query.exec((err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        });
    });
}

function queryShelByRegion(region: string, userData: Tools.ICodeInfo): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let query: any = {};
        if (region && /[0-9]{2,2}/g.test(region)) {
            region = Auth_Permissions.Region_Code[region];
        }
        if (region) {
            query['geoData.location.region'] = { $in: [region.toLowerCase(), region.toUpperCase(), toTitleCase(region), region] };
        }
        const regions = Tools.getRegions(userData);
        const sections = Tools.getSections(userData);
        query = Object.assign({}, query, getQueryFilters(regions, sections));

        Shelters.count(query).exec((err, ris: number) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        });
    });
}

function queryShelAroundPoint(point: { lat: number, lng: number }, range: number, userData: Tools.ICodeInfo)
    : Promise<IShelterExtended[]> {
    return new Promise<IShelterExtended[]>((resolve, reject) => {
        const query: any = {};
        const regions = Tools.getRegions(userData);
        const sections = Tools.getSections(userData);
        query.$and = [
            { 'geoData.location.latitude': { $gt: (point.lat - range), $lt: (point.lat + range) } },
            { 'geoData.location.longitude': { $gt: (point.lng - range), $lt: (point.lng + range) } }
        ].concat(getQueryFilters(regions, sections).$and);

        Shelters.find(query,
            `name idCai type branch owner category insertDate updateDate geoData.location.longitude geoData.location.latitude
             geoData.location.municipality geoData.location.region geoData.location.province`)
            .exec((err, ris) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ris);
                }
            });
    });
}

function queryServById(id): Promise<IServiceExtended> {
    return new Promise<IServiceExtended>((resolve, reject) => {
        Services.findById(id, function (err, serv) {
            if (err) {
                reject(err);
            } else {
                resolve(serv);
            }
        });
    });
}

function queryServWithParams(params): Promise<Array<IServiceExtended>> {
    return new Promise<Array<IServiceExtended>>((resolve, reject) => {
        Services.find(params).populate('services').exec(function (err, ris) {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        });
    });
}

function insertNewShelter(params): Promise<IShelterExtended> {
    return new Promise<IShelterExtended>((resolve, reject) => {
        const services: IServiceExtended[] = params.services;
        params.services = [];
        const shelter = new Shelters(params);
        shelter.save(function (err, shel) {
            if (err) {
                reject(err)
            } else {
                if (services) {
                    for (const serv of services) {
                        insertNewService(serv)
                            .then((ser) => {
                                shel.services.push(<any>ser._id);

                                if (shel.services.length === services.length) {
                                    shel.save();
                                    resolve(shel);
                                }
                            })
                            .catch((e) => {
                                reject(e);
                            })
                    }
                } else {
                    resolve(shel);
                }
            }
        })
    });
}

function insertNewService(params): Promise<IServiceExtended> {
    return new Promise<IServiceExtended>((resolve, reject) => {
        const shelter = new Services(params);
        shelter.save(function (err, serv: IServiceExtended) {
            if (err) {
                reject(err)
            } else {
                resolve(serv);
            }
        })
    });
}

function checkPermissionAPI(req, res, next) {
    if (DISABLE_AUTH) {
        next();
    } else {
        const user = req.body.user;
        if (user) {
            if (req.method === 'GET') {
                next();
            } else {
                if (req.method === 'DELETE' || req.method === 'POST') {
                    if (user.role === Auth_Permissions.User_Type.central) {
                        next();
                    } else {
                        res.status(500).send({ error: 'Invalid user or request' });
                    }
                } else if (req.method === 'PUT') {
                    if (Auth_Permissions.Revision.DetailRevisionPermission.find(obj => obj === user.role)) {
                        next();
                    } else {
                        res.status(500).send({ error: 'Invalid user or request' });
                    }
                } else {
                    res.status(501).send({ error: 'Not Implemented method ' + req.method });
                }
            }
        } else {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    }
}

function deleteShelter(id): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (id) {
            Shelters.remove({ _id: id }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        } else {
            reject(new Error('Invalid id'));
        }
    });
}

function resolveSingleServiceInShelter(shelter, service): Promise<any> {
    const c = getPropertiesNumber(service);

    if (service.hasOwnProperty('_id') && c === 1) {
        return deleteService(service._id);
    } else {
        if (service._id) {
            return updateService(service._id, service)
        } else {
            return insertNewService(service)
                .then((serv) => {
                    shelter.services.push(serv._id);
                });
        }
    }
}

function resolveServicesInShelter(shelter, services): Promise<IShelterExtended> {
    return new Promise<IShelterExtended>((resolve, reject) => {
        if (services) {

            const promises = [];

            services.forEach(service => {
                promises.push(resolveSingleServiceInShelter(shelter, service));
            });

            Promise.all(promises)
                .then(() => {
                    shelter.save();
                    resolve(shelter);
                })
                .catch(e => reject(e));

        } else {
            resolve(shelter);
        }
    });
}

// TODO! PDF economy
function updateShelterEconomy(shelter: IShelterExtended, economies: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        if (economies) {
            for (const economy of economies) {
                const e = shelter.economy.filter(obj => obj.year === economy.year)[0];
                if (e) {
                    shelter.economy.splice(shelter.economy.indexOf(e), 1);
                }
                shelter.economy.push(economy);
            }
        }
        resolve();
    });
}

function updateShelterUse(shelter: IShelterExtended, uses: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        if (uses) {
            for (const use of uses) {
                if (!shelter.use || (<any[]>shelter.use).length === 0) {
                    shelter.use = <any>uses;
                } else {
                    const index = shelter.use.findIndex(obj => obj.year === use.year);
                    if (index >= 0) {
                        shelter.use.splice(index, 1);
                    }
                    shelter.use = <any>shelter.use.concat(use);
                }
            }
        }
        resolve();
    });
}

function updateShelterContributions(shelter: IShelterExtended, contributions: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        if (contributions && contributions.accepted) {
            createContributionPDF(shelter)
                .then(file => {
                    shelter.contributions = undefined;
                    resolve();
                })
                .catch((e) => {
                    reject(e);
                });
        } else {
            resolve();
        }
    });
}

function resolveEconomyInShelter(shelter: IShelterExtended, uses: any[], contributions: any, economies: any[]): Promise<IShelterExtended> {
    return new Promise<IShelterExtended>((resolve, reject) => {
        try {
            Promise.all([
                updateShelterEconomy(shelter, economies),
                updateShelterUse(shelter, uses),
                updateShelterContributions(shelter, contributions)
            ])
                .then(() => {
                    resolve(shelter);
                })
                .catch(err => {
                    reject(err);
                });
        } catch (e) {
            reject(e);
        }
    });
}

function cleanShelterProps(shelter, params) {
    for (const prop in shelter) {
        if (Object.getPrototypeOf(shelter).hasOwnProperty(prop) &&
            Object.getPrototypeOf(params).hasOwnProperty(prop)) {
            shelter[prop] = undefined;
        } else if (shelter[prop] == null) {
            shelter[prop] = undefined;
        }
    }
}

function updateShelter(id: any, params: any, isNew?: Boolean): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const services: any[] = params.services;
            const use: any[] = params.use;
            const contributions = params.contributions;
            const economy: any[] = params.economy;
            delete (params.services);
            delete (params.use);
            delete (params.economy);
            const options: any = { upsert: isNew || false, new: true };
            if (!params.updateDate) {
                params.updateDate = new Date(Date.now());
            }
            Shelters.findByIdAndUpdate(id, { $set: params }, options, function (err, shel) {
                if (err) {
                    logger(LOG_TYPE.WARNING, err);
                    reject(err);
                } else {
                    cleanShelterProps(shel, params);

                    resolveServicesInShelter(shel, services)
                        .then((shelter) => {
                            resolveEconomyInShelter(shelter, use, contributions, economy)
                                .then((s) => {
                                    s.save();
                                    resolve(true);
                                })
                                .catch((e) => {
                                    reject(e);
                                });
                        })
                        .catch((e) => {
                            reject(e);
                        });
                }
            })
        } catch (e) {
            reject(e);
        }
    });
}

function confirmShelter(id: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const shelToUpdate = getShelterToUpdateById(id);
        updateShelter(id, shelToUpdate.shelter, shelToUpdate.isNew)
            .then(() => {
                removeShelterToUpdate(shelToUpdate);
                resolve(true);
            })
            .catch((err) => {
                removeShelterToUpdate(shelToUpdate);
                logger(LOG_TYPE.WARNING, err);
                reject(err);
            });
    });
}

function addOpening(id, opening: IOpening): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        Shelters.findById(id, 'openingTime', function (err, shelter) {
            if (err) {
                reject(err);
            } else {
                shelter.openingTime.push(opening);
                shelter.save(function (e) {
                    if (e) {
                        reject(e);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}

function updateService(id, params: IServiceExtended): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        Services.update({ _id: id }, params, { upsert: true }, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        })
    });
}

function deleteShelterService(shelterId, serviceId): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        queryShelById(shelterId)
            .then((shelter) => {
                deleteService(serviceId)
                    .then(() => {
                        shelter.save();
                        resolve(true);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
    });
}

function deleteService(id): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (id) {
            Services.remove({ _id: id }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        }
    });
}

export const appRoute = express.Router();
appRoute.all('*', checkPermissionAPI);

appRoute.route('/shelters')
    .get(function (req, res) {
        const user: UserData = req.body.user;
        const userData: Tools.ICodeInfo = getUserDataFilters(user);
        if (userData) {
            try {
                getAllIdsHead(userData)
                    .then((rif) => {
                        if (rif) {
                            res.status(200).send(rif);
                        } else {
                            res.status(404).send({ error: 'No Matcching Rifugio' });
                        }
                    })
                    .catch((err) => {
                        logger(LOG_TYPE.ERROR, err);
                        res.status(500).send({ error: 'Invalid user or request' });
                    });
            } catch (e) {
                logger(LOG_TYPE.ERROR, e);
                res.status(500).send({ error: 'Invalid user or request' });
            }
        } else {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    })
    .post(function (req, res) {
        insertNewShelter(req.body)
            .then((shelter) => {
                const id = shelter._id;
                delete (shelter._id);
                res.status(200).send({ id: id, shelter: shelter });
            })
            .catch((err) => {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({ error: 'Invalid user or request' });
            });
    });

appRoute.route('/shelters/country/:name')
    .get(function (req, res) {
        const user: UserData = req.body.user;
        const userData = getUserDataFilters(user);
        if (userData) {
            try {
                queryShelByRegion(req.params.name, userData)
                    .then((ris) => {
                        res.status(200).send({ num: ris });
                    })
                    .catch((err) => {
                        logger(LOG_TYPE.WARNING, err);
                        res.status(500).send({ error: 'Invalid user or request' });
                    });
            } catch (e) {
                logger(LOG_TYPE.ERROR, e);
                res.status(500).send({ error: 'Invalid user or request' });
            }
        } else {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    });

appRoute.route('/shelters/point')
    .get(function (req, res) {
        const user: UserData = req.body.user;
        const userData = getUserDataFilters(user);
        if (userData) {
            try {
                if (req.query.lat && req.query.lng && req.query.range) {
                    queryShelAroundPoint({ lat: Number(req.query.lat), lng: Number(req.query.lng) }
                        , Number(req.query.range), userData)
                        .then((ris) => {
                            res.status(200).send(ris);
                        })
                        .catch((err) => {
                            logger(LOG_TYPE.WARNING, err);
                            res.status(500).send({ error: 'Invalid user or request' });
                        });
                } else {
                    res.status(500).send({ error: 'Invalid user or request' });
                }
            } catch (e) {
                logger(LOG_TYPE.ERROR, e);
                res.status(500).send({ error: 'Invalid user or request' });
            }
        } else {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    });

appRoute.route('/shelters/:id')
    .get(function (req, res) {
        try {
            if (ObjectId.isValid(req.params.id)) {
                queryShelById(req.params.id)
                    .then((rif) => {
                        if (rif != null) {
                            res.status(200).send(rif);
                        } else {
                            res.status(200).send({ _id: req.params.id });
                        }
                    })
                    .catch((err) => {
                        res.status(500).send({ error: 'Invalid user or request' });
                    });
            } else {
                res.status(500).send({ error: 'Invalid user or request' });
            }
        } catch (e) {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    })
    .put(function (req, res) {
        let shelUpdate: UpdatingShelter;
        if (req.query.confirm) {
            shelUpdate = getShelterToUpdateById(req.params.id);
            if (shelUpdate) {
                for (const prop in req.body) {
                    if (req.body.hasOwnProperty(prop)) {
                        shelUpdate.shelter[prop] = req.body[prop];
                    }
                }
                shelUpdate.watchDog = new Date(Date.now());
            } else {
                const newShelter: IShelterExtended = req.body;
                newShelter._id = req.params.id;
                shelUpdate = { watchDog: new Date(Date.now()), shelter: newShelter, files: null }
                addShelterToUpdate(shelUpdate, req.body.user);
            }
            res.status(200).send(true);

        } else {
            updateShelter(req.params.id, req.body, shelUpdate && shelUpdate.isNew)
                .then(() => {
                    res.status(200).send(true);
                })
                .catch((err) => {
                    logger(LOG_TYPE.WARNING, err);
                    res.status(500).send({ error: 'Invalid user or request' });
                });
        }
    })
    .delete(function (req, res) {
        deleteShelter(req.params.id)
            .then(() => {
                res.status(200).send(true);
            })
            .catch((err) => {
                res.status(500).send({ error: 'Invalid user or request' });
            });
    });

appRoute.route('/shelters/confirm/:id')
    .put(function (req, res) {
        try {
            if (req.body.confirm !== undefined) {
                const shelToConfirm = getShelterToUpdateById(req.params.id);
                if (shelToConfirm) {
                    if (req.body.confirm) {
                        confirmShelter(req.params.id)
                            .then((ris) => resolveFilesForShelter(shelToConfirm))
                            .then((ris) => {
                                res.status(200).send(true);
                            })
                            .catch((err) => {
                                res.status(500).send({ error: 'Invalid user or request' });
                            });
                    } else {
                        removeShelterToUpdate(shelToConfirm);
                        res.status(200).send(true);
                    }
                } else {
                    res.status(200).send(true);
                }
            } else if (req.body.new) {
                const id = new ObjectId();
                const newShelter: any = { _id: id };
                addShelterToUpdate({ watchDog: new Date(Date.now()), shelter: newShelter, files: null, isNew: true }, req.body.user);
                res.status(200).send({ id: id });
            } else {
                res.status(500).send({ error: 'Invalid user or request' });
            }

        } catch (e) {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    });

appRoute.route('/shelters/confirm/:section/:id')
    .put(function (req, res) {
        try {
            const shelUpdate = getShelterToUpdateById(req.params.id);
            if (shelUpdate) {
                shelUpdate.shelter[req.params.section] = req.body[req.params.section];
                shelUpdate.watchDog = new Date(Date.now());
            } else {
                const newShelter: IShelterExtended = req.body;
                newShelter._id = req.params.id;

                addShelterToUpdate({ watchDog: new Date(Date.now()), shelter: newShelter, files: null }, req.body.user);
            }
            res.status(200).send(true);
        } catch (e) {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    })

appRoute.route('/shelters/page/:pageSize')
    .get(function (req, res) {
        try {
            queryShelPage(0, req.params.pageSize)
                .then((ris) => {
                    res.status(200).send(ris);
                })
                .catch((err) => {
                    res.status(500).send(err);
                })
        } catch (e) {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    });

appRoute.route('/shelters/page/:pageNumber/:pageSize')
    .get(function (req, res) {
        try {
            queryShelPage(req.params.pageNumber, req.params.pageSize)
                .then((ris) => {
                    res.status(200).send(ris);
                })
                .catch((err) => {
                    res.status(500).send({ error: 'Invalid user or request' });
                })
        } catch (e) {
            res.status(500).send({ error: 'Invalid user or request' });
        }
    });

appRoute.route('/shelters/:id/:name')
    .get(function (req, res) {
        try {
            const shelUpdate = getShelterToUpdateById(req.params.id);
            if (shelUpdate && shelUpdate.shelter[req.params.name]) {
                shelUpdate.watchDog = new Date(Date.now());
                res.status(200).send(shelUpdate.shelter);
            } else {
                queryShelSectionById(req.params.id, req.params.name)
                    .then((ris) => {
                        if (ris != null) {
                            res.status(200).send(ris);
                        } else {
                            res.status(200).send({ _id: req.params.id });
                        }
                    })
                    .catch((err) => {
                        logger(LOG_TYPE.INFO, err);
                        res.status(500).send({ error: 'Invalid user or request' });
                    });
            }
        } catch (e) {
            logger(LOG_TYPE.WARNING, e);
            res.status(500).send({ error: 'Invalid user or request' });
        }
    })
    .delete(function (req, res) {
        deleteService(req.params.name)
            .then(() => {
                res.status(200).send(true);
            })
            .catch((err) => {
                logger(LOG_TYPE.INFO, err);
                res.status(500).send({ error: 'Invalid user or request' });
            });
    });
