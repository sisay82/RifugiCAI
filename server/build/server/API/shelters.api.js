"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var enums_1 = require("../../src/app/shared/types/enums");
var Auth_Permissions = enums_1.Enums.Auth_Permissions;
var common_1 = require("../tools/common");
var mongoose = require("mongoose");
var schema_1 = require("../../src/app/shared/types/schema");
var common_2 = require("../tools/common");
var auth_api_1 = require("./auth.api");
var pdf_api_1 = require("./pdf.api");
var files_api_1 = require("./files.api");
var Services = mongoose.model('Services', schema_1.Schema.serviceSchema);
var Shelters = mongoose.model('Shelters', schema_1.Schema.shelterSchema);
function getRegionFilter(region) {
    if (region && region.length === 2) {
        var regionQuery = { 'idCai': new RegExp('^[0-9-]{2,2}' + region + '[0-9-]{4,6}') };
        return regionQuery;
    }
    else {
        return null;
    }
}
function getSectionFilter(section) {
    if (section && section.length === 3) {
        var sectionQuery = { 'idCai': new RegExp('^[0-9-]{4,4}' + section + '[0-9-]{1,3}') };
        return sectionQuery;
    }
    else {
        return null;
    }
}
function getAllIdsHead(regions, section) {
    var query = {};
    if ((regions && regions.length > 0) || section) {
        query.$and = [];
        query.$and.push({ idCai: { '$ne': null } });
        for (var _i = 0, regions_1 = regions; _i < regions_1.length; _i++) {
            var region = regions_1[_i];
            var regionFilter = getRegionFilter(region);
            if (regionFilter) {
                query.$and.push(regionFilter);
            }
        }
        var sectionFilter = getSectionFilter(section);
        if (sectionFilter) {
            query.$and.push(sectionFilter);
        }
    }
    return new Promise(function (resolve, reject) {
        Shelters.find(query, 'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality')
            .exec(function (err, ris) {
            if (err) {
                common_2.logger(err);
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryShelPage(pageNumber, pageSize) {
    return new Promise(function (resolve, reject) {
        Shelters.find({}, 'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality')
            .skip(Number(pageNumber * pageSize)).limit(Number(pageSize)).exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryShelById(id) {
    return new Promise(function (resolve, reject) {
        Shelters.findById(id).populate('services').exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryShelSectionById(id, section) {
    return new Promise(function (resolve, reject) {
        Shelters.findOne({ _id: id }, 'name ' + section).populate('services').exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryShelByRegion(region, regionFilters, sectionFilter) {
    return new Promise(function (resolve, reject) {
        var query = {};
        if (region && /[0-9]{2,2}/g.test(region)) {
            region = Auth_Permissions.Region_Code[region];
        }
        if (region) {
            query['geoData.location.region'] = { $in: [region.toLowerCase(), region.toUpperCase(), common_2.toTitleCase(region), region] };
        }
        if ((regionFilters && regionFilters.length > 0) || sectionFilter) {
            query.$and = [];
            query.$and.push({ 'idCai': { '$ne': null } });
            for (var _i = 0, regionFilters_1 = regionFilters; _i < regionFilters_1.length; _i++) {
                var regionFilter = regionFilters_1[_i];
                var r = getRegionFilter(regionFilter);
                if (r) {
                    query.$and.push(r);
                }
            }
            var section = getSectionFilter(sectionFilter);
            if (section) {
                query.$and.push(section);
            }
        }
        Shelters.count(query).exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryShelAroundPoint(point, range, regionFilters, sectionFilter) {
    return new Promise(function (resolve, reject) {
        var query = {};
        query.$and = [
            { 'geoData.location.latitude': { $gt: (point.lat - range), $lt: (point.lat + range) } },
            { 'geoData.location.longitude': { $gt: (point.lng - range), $lt: (point.lng + range) } }
        ];
        if ((regionFilters && regionFilters.length > 0) || sectionFilter) {
            query.$and.push({ 'idCai': { '$ne': null } });
            for (var _i = 0, regionFilters_2 = regionFilters; _i < regionFilters_2.length; _i++) {
                var regionFilter = regionFilters_2[_i];
                var region = getRegionFilter(regionFilter);
                if (region) {
                    query.$and.push(region);
                }
            }
            var section = getSectionFilter(sectionFilter);
            if (section) {
                query.$and.push(section);
            }
        }
        Shelters.find(query, "name idCai type branch owner category insertDate updateDate geoData.location.longitude geoData.location.latitude\n             geoData.location.municipality geoData.location.region geoData.location.province")
            .exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryServById(id) {
    return new Promise(function (resolve, reject) {
        Services.findById(id, function (err, serv) {
            if (err) {
                reject(err);
            }
            else {
                resolve(serv);
            }
        });
    });
}
function queryServWithParams(params) {
    return new Promise(function (resolve, reject) {
        Services.find(params).populate('services').exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function insertNewShelter(params) {
    return new Promise(function (resolve, reject) {
        var services = params.services;
        params.services = [];
        var shelter = new Shelters(params);
        shelter.save(function (err, shel) {
            if (err) {
                reject(err);
            }
            else {
                if (services) {
                    for (var _i = 0, services_1 = services; _i < services_1.length; _i++) {
                        var serv = services_1[_i];
                        insertNewService(serv)
                            .then(function (ser) {
                            shel.services.push(ser._id);
                            if (shel.services.length === services.length) {
                                shel.save();
                                resolve(shel);
                            }
                        })
                            .catch(function (e) {
                            reject(e);
                        });
                    }
                }
                else {
                    resolve(shel);
                }
            }
        });
    });
}
function insertNewService(params) {
    return new Promise(function (resolve, reject) {
        var shelter = new Services(params);
        shelter.save(function (err, serv) {
            if (err) {
                reject(err);
            }
            else {
                resolve(serv);
            }
        });
    });
}
function checkPermissionAPI(req, res, next) {
    if (auth_api_1.DISABLE_AUTH) {
        next();
    }
    else {
        var user_1 = req.body.user;
        if (user_1) {
            if (req.method === 'GET') {
                next();
            }
            else {
                if (req.method === 'DELETE' || req.method === 'POST') {
                    if (user_1.role === Auth_Permissions.User_Type.central) {
                        next();
                    }
                    else {
                        res.status(500).send({ error: 'Unauthorized' });
                    }
                }
                else if (req.method === 'PUT') {
                    if (Auth_Permissions.Revision.DetailRevisionPermission.find(function (obj) { return obj === user_1.role; })) {
                        next();
                    }
                    else {
                        res.status(500).send({ error: 'Unauthorized' });
                    }
                }
                else {
                    res.status(501).send({ error: 'Not Implemented method ' + req.method });
                }
            }
        }
        else {
            res.status(500).send({ error: 'Error request' });
        }
    }
}
function deleteShelter(id) {
    return new Promise(function (resolve, reject) {
        if (id) {
            Shelters.remove({ _id: id }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        }
        else {
            reject(new Error('Invalid id'));
        }
    });
}
function resolveSingleServiceInShelter(shelter, service) {
    var c = common_2.getPropertiesNumber(service);
    if (service.hasOwnProperty('_id') && c === 1) {
        return deleteService(service._id);
    }
    else {
        if (service._id) {
            return updateService(service._id, service);
        }
        else {
            return insertNewService(service)
                .then(function (serv) {
                shelter.services.push(serv._id);
            });
        }
    }
}
function resolveServicesInShelter(shelter, services) {
    return new Promise(function (resolve, reject) {
        if (services) {
            var promises_1 = [];
            services.forEach(function (service) {
                promises_1.push(resolveSingleServiceInShelter(shelter, service));
            });
            Promise.all(promises_1)
                .then(function () {
                shelter.save();
                resolve(shelter);
            })
                .catch(function (e) { return reject(e); });
        }
        else {
            resolve(shelter);
        }
    });
}
function updateShelterEconomy(shelter, economies) {
    return new Promise(function (resolve, reject) {
        if (economies) {
            var _loop_1 = function (economy) {
                var e = shelter.economy.filter(function (obj) { return obj.year === economy.year; })[0];
                if (e) {
                    shelter.economy.splice(shelter.economy.indexOf(e), 1);
                }
                shelter.economy.push(economy);
            };
            for (var _i = 0, economies_1 = economies; _i < economies_1.length; _i++) {
                var economy = economies_1[_i];
                _loop_1(economy);
            }
        }
        resolve();
    });
}
function updateShelterUse(shelter, uses) {
    return new Promise(function (resolve, reject) {
        if (uses) {
            var _loop_2 = function (use) {
                var u = shelter.use.filter(function (obj) { return obj.year === use.year; })[0];
                if (u) {
                    shelter.use.splice(shelter.use.indexOf(u), 1);
                }
                shelter.use.push(use);
            };
            for (var _i = 0, uses_1 = uses; _i < uses_1.length; _i++) {
                var use = uses_1[_i];
                _loop_2(use);
            }
        }
        resolve();
    });
}
function updateShelterContributions(shelter, contributions) {
    return new Promise(function (resolve, reject) {
        if (contributions && contributions.accepted) {
            pdf_api_1.createContributionPDF(shelter)
                .then(function (file) {
                shelter.contributions = undefined;
                resolve();
            })
                .catch(function (e) {
                reject(e);
            });
        }
        else {
            resolve();
        }
    });
}
function resolveEconomyInShelter(shelter, uses, contributions, economies) {
    return new Promise(function (resolve, reject) {
        try {
            Promise.all([updateShelterEconomy(shelter, economies),
                updateShelterUse(shelter, uses),
                updateShelterContributions(shelter, contributions)])
                .then(function () {
                resolve(shelter);
            })
                .catch(function (err) {
                reject(err);
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
function cleanShelterProps(shelter, params) {
    for (var prop in shelter) {
        if (Object.getPrototypeOf(shelter).hasOwnProperty(prop) &&
            Object.getPrototypeOf(params).hasOwnProperty(prop)) {
            shelter[prop] = undefined;
        }
        else if (shelter[prop] == null) {
            shelter[prop] = undefined;
        }
    }
}
function updateShelter(id, params, isNew) {
    return new Promise(function (resolve, reject) {
        try {
            var services_2 = params.services;
            var use_1 = params.use;
            var contributions_1 = params.contributions;
            var economy_1 = params.economy;
            delete (params.services);
            delete (params.use);
            delete (params.economy);
            var options = { upsert: isNew || false, new: true };
            if (!params.updateDate) {
                params.updateDate = new Date(Date.now());
            }
            Shelters.findByIdAndUpdate(id, { $set: params }, options, function (err, shel) {
                if (err) {
                    common_2.logger(err);
                    reject(err);
                }
                else {
                    cleanShelterProps(shel, params);
                    resolveServicesInShelter(shel, services_2)
                        .then(function (shelter) {
                        resolveEconomyInShelter(shelter, use_1, contributions_1, economy_1)
                            .then(function (s) {
                            s.save();
                            resolve(true);
                        })
                            .catch(function (e) {
                            reject(e);
                        });
                    })
                        .catch(function (e) {
                        reject(e);
                    });
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
function confirmShelter(id) {
    return new Promise(function (resolve, reject) {
        var shelToUpdate = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === id; })[0];
        updateShelter(id, shelToUpdate.shelter)
            .then(function () {
            common_1.SheltersToUpdate.splice(common_1.SheltersToUpdate.indexOf(shelToUpdate), 1);
            resolve(true);
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
function addOpening(id, opening) {
    return new Promise(function (resolve, reject) {
        Shelters.findById(id, 'openingTime', function (err, shelter) {
            if (err) {
                reject(err);
            }
            else {
                shelter.openingTime.push(opening);
                shelter.save(function (e) {
                    if (e) {
                        reject(e);
                    }
                    else {
                        resolve(true);
                    }
                });
            }
        });
    });
}
function updateService(id, params) {
    return new Promise(function (resolve, reject) {
        Services.update({ _id: id }, params, { upsert: true }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
function deleteShelterService(shelterId, serviceId) {
    return new Promise(function (resolve, reject) {
        queryShelById(shelterId)
            .then(function (shelter) {
            deleteService(serviceId)
                .then(function () {
                shelter.save();
                resolve(true);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    });
}
function deleteService(id) {
    return new Promise(function (resolve, reject) {
        if (id) {
            Services.remove({ _id: id }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        }
    });
}
exports.appRoute = express.Router();
exports.appRoute.all('*', checkPermissionAPI);
exports.appRoute.route('/shelters')
    .get(function (req, res) {
    var user = req.body.user;
    var userData = common_2.checkUserData(user);
    if (userData) {
        try {
            getAllIdsHead(userData.regions, userData.section)
                .then(function (rif) {
                if (rif) {
                    res.status(200).send(rif);
                }
                else {
                    res.status(404).send({ error: 'No Matcching Rifugio' });
                }
            })
                .catch(function (err) {
                res.status(500).send(err);
            });
        }
        catch (e) {
            res.status(500).send({ error: 'Error Undefined' });
        }
    }
    else {
        res.status(500).send({ error: 'User undefined' });
    }
})
    .post(function (req, res) {
    insertNewShelter(req.body)
        .then(function (shelter) {
        var id = shelter._id;
        delete (shelter._id);
        res.status(200).send({ id: id, shelter: shelter });
    })
        .catch(function (err) {
        res.status(500).send(err);
    });
});
exports.appRoute.route('/shelters/country/:name')
    .get(function (req, res) {
    var user = req.body.user;
    var userData = common_2.checkUserData(user);
    if (userData) {
        try {
            queryShelByRegion(req.params.name, userData.regions, userData.section)
                .then(function (ris) {
                res.status(200).send({ num: ris });
            })
                .catch(function (err) {
                common_2.logger(err);
                res.status(500).send(err);
            });
        }
        catch (e) {
            common_2.logger(e);
            res.status(500).send({ error: 'Error Undefined' });
        }
    }
    else {
        res.status(500).send({ error: 'User undefined' });
    }
});
exports.appRoute.route('/shelters/point')
    .get(function (req, res) {
    var user = req.body.user;
    var userData = common_2.checkUserData(user);
    if (userData) {
        try {
            if (req.query.lat && req.query.lng && req.query.range) {
                queryShelAroundPoint({ lat: Number(req.query.lat), lng: Number(req.query.lng) }, Number(req.query.range), userData.regions, userData.section)
                    .then(function (ris) {
                    res.status(200).send(ris);
                })
                    .catch(function (err) {
                    common_2.logger(err);
                    res.status(500).send(err);
                });
            }
            else {
                res.status(500).send({ error: 'Query error, parameters not found' });
            }
        }
        catch (e) {
            common_2.logger(e);
            res.status(500).send({ error: 'Error Undefined' });
        }
    }
    else {
        res.status(500).send({ error: 'User undefined' });
    }
});
exports.appRoute.route('/shelters/:id')
    .get(function (req, res) {
    try {
        if (common_2.ObjectId.isValid(req.params.id)) {
            queryShelById(req.params.id)
                .then(function (rif) {
                if (rif != null) {
                    res.status(200).send(rif);
                }
                else {
                    res.status(200).send({ _id: req.params.id });
                }
            })
                .catch(function (err) {
                res.status(500).send(err);
            });
        }
        else {
            res.status(500).send({ error: 'Error ID' });
        }
    }
    catch (e) {
        res.status(500).send({ error: 'Error Undefined' });
    }
})
    .put(function (req, res) {
    var shelUpdate;
    if (req.query.confirm) {
        shelUpdate = common_1.SheltersToUpdate.filter(function (shelter) { return shelter.shelter._id === req.params.id; })[0];
        if (shelUpdate) {
            for (var prop in req.body) {
                if (req.body.hasOwnProperty(prop)) {
                    shelUpdate.shelter[prop] = req.body[prop];
                }
            }
            shelUpdate.watchDog = new Date(Date.now());
        }
        else {
            var newShelter = req.body;
            newShelter._id = req.params.id;
            shelUpdate = { watchDog: new Date(Date.now()), shelter: newShelter, files: null };
            common_1.SheltersToUpdate.push(shelUpdate);
        }
        res.status(200).send(true);
    }
    else {
        updateShelter(req.params.id, req.body, shelUpdate && shelUpdate.isNew)
            .then(function () {
            res.status(200).send(true);
        })
            .catch(function (err) {
            common_2.logger(err);
            res.status(500).send(err);
        });
    }
})
    .delete(function (req, res) {
    deleteShelter(req.params.id)
        .then(function () {
        res.status(200).send(true);
    })
        .catch(function (err) {
        res.status(500).send(err);
    });
});
exports.appRoute.route('/shelters/confirm/:id')
    .put(function (req, res) {
    try {
        if (req.body.confirm !== undefined) {
            var shelToConfirm_1 = common_1.SheltersToUpdate.filter(function (shelter) { return shelter.shelter._id === req.params.id; })[0];
            if (shelToConfirm_1) {
                if (req.body.confirm) {
                    confirmShelter(req.params.id)
                        .then(function (ris) { return files_api_1.resolveFilesForShelter(shelToConfirm_1); })
                        .then(function (ris) {
                        res.status(200).send(true);
                    })
                        .catch(function (err) {
                        res.status(500).send(err);
                    });
                }
                else {
                    common_1.SheltersToUpdate.splice(common_1.SheltersToUpdate.indexOf(shelToConfirm_1), 1);
                    res.status(200).send(true);
                }
            }
            else {
                res.status(200).send(true);
            }
        }
        else if (req.body.new) {
            var id = new common_2.ObjectId();
            var newShelter = { _id: id };
            common_1.SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: null, isNew: true });
            res.status(200).send({ id: id });
        }
        else {
            res.status(500).send({ error: 'command not found' });
        }
    }
    catch (e) {
        res.status(500).send({ error: 'Error Undefined' });
    }
});
exports.appRoute.route('/shelters/confirm/:section/:id')
    .put(function (req, res) {
    try {
        var shelUpdate = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === req.params.id; });
        if (shelUpdate.length > 0) {
            shelUpdate[0].shelter[req.params.section] = req.body[req.params.section];
            shelUpdate[0].watchDog = new Date(Date.now());
        }
        else {
            var newShelter = req.body;
            newShelter._id = req.params.id;
            common_1.SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: null });
        }
        res.status(200).send(true);
    }
    catch (e) {
        res.status(500).send({ error: 'Error Undefined' });
    }
});
exports.appRoute.route('/shelters/page/:pageSize')
    .get(function (req, res) {
    try {
        queryShelPage(0, req.params.pageSize)
            .then(function (ris) {
            res.status(200).send(ris);
        })
            .catch(function (err) {
            res.status(500).send(err);
        });
    }
    catch (e) {
        res.status(500).send({ error: 'Error Undefined' });
    }
});
exports.appRoute.route('/shelters/page/:pageNumber/:pageSize')
    .get(function (req, res) {
    try {
        queryShelPage(req.params.pageNumber, req.params.pageSize)
            .then(function (ris) {
            res.status(200).send(ris);
        })
            .catch(function (err) {
            res.status(500).send(err);
        });
    }
    catch (e) {
        res.status(500).send({ error: 'Error Undefined' });
    }
});
exports.appRoute.route('/shelters/:id/:name')
    .get(function (req, res) {
    try {
        var shelUpdate = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === req.params.id; });
        if (shelUpdate.length > 0 && shelUpdate[0].shelter[req.params.name]) {
            shelUpdate[0].watchDog = new Date(Date.now());
            res.status(200).send(shelUpdate[0].shelter);
        }
        else {
            queryShelSectionById(req.params.id, req.params.name)
                .then(function (ris) {
                if (ris != null) {
                    res.status(200).send(ris);
                }
                else {
                    res.status(200).send({ _id: req.params.id });
                }
            })
                .catch(function (err) {
                res.status(500).send(err);
            });
        }
    }
    catch (e) {
        res.status(500).send({ error: 'Error Undefined' });
    }
})
    .delete(function (req, res) {
    deleteService(req.params.name)
        .then(function () {
        res.status(200).send(true);
    })
        .catch(function (err) {
        res.status(500).send(err);
    });
});
//# sourceMappingURL=shelters.api.js.map