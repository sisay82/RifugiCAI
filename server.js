"use strict";
exports.__esModule = true;
var path = require("path");
var mongoose = require("mongoose");
var session = require("express-session");
var bodyParser = require("body-parser");
var express = require("express");
var schema_1 = require("./src/app/shared/types/schema");
var enums_1 = require("./src/app/shared/types/enums");
var multer = require("multer");
var request = require("request");
var xmldom = require("xmldom");
var DOMParser = xmldom.DOMParser;
var casBaseUrl = "https://prova.cai.it";
var authUrl = "https://prova.cai.it/cai-integration-ws/secured/users/";
var serverUrl = "rifugi.cai.it";
var appPort = 8000;
var appBaseUrl = "http://" + serverUrl;
var app = express();
var parsedUrl = encodeURIComponent(appBaseUrl + "/j_spring_cas_security_check");
var userList = [];
var centralRole = "ROLE_RIFUGI_ADMIN";
var regionalRoleName = "PGR";
var sectionalPRoleName = "Responsabile Esterno Sezione";
var sectionalURoleName = "Operatore Sezione Esteso";
var ObjectId = mongoose.Types.ObjectId;
var Services = mongoose.model("Services", schema_1.Schema.serviceSchema);
var Shelters = mongoose.model("Shelters", schema_1.Schema.shelterSchema);
var Files = mongoose.model("Files", schema_1.Schema.fileSchema);
var SheltersToUpdate = [];
var maxTime = 1000 * 60 * 10;
var stop = false;
var maxImages = 10;
/**
 * SECTION AUTH
 */
function getChildByName(node, name) {
    for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName == name) {
            return node.childNodes.item(i);
        }
        if (node.childNodes.item(i).hasChildNodes()) {
            var n = getChildByName(node.childNodes.item(i), name);
            if (n) {
                return n;
            }
        }
    }
    return null;
}
function getChildsByName(node, name) {
    var nodes = [];
    for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes.item(i).localName == name) {
            nodes.push(node.childNodes.item(i));
        }
        if (node.childNodes.item(i).hasChildNodes()) {
            var n = getChildsByName(node.childNodes.item(i), name);
            if (n) {
                nodes = nodes.concat(n);
            }
        }
    }
    return nodes;
}
function getTargetNodesByName(node, name, target) {
    var nodes = [];
    for (var _i = 0, _a = getChildsByName(node, name); _i < _a.length; _i++) {
        var n = _a[_i];
        var child = getChildByName(n, target);
        if (child) {
            nodes.push(child);
        }
    }
    return nodes;
}
function getRole(data) {
    if (data.aggregatedAuthorities && data.aggregatedAuthorities.find(function (obj) { return obj.role == centralRole; })) {
        return enums_1.Enums.User_Type.central;
    }
    else if (data.userGroups) {
        if (data.userGroups.find(function (obj) { return obj.name == regionalRoleName; })) {
            return enums_1.Enums.User_Type.regional;
        }
        else if (data.userGroups.find(function (obj) { return obj.name == sectionalPRoleName || obj.name == sectionalURoleName; })) {
            return enums_1.Enums.User_Type.sectional;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
function checkUserPromise(uuid) {
    console.log("CHECKUSER");
    return new Promise(function (resolve, reject) {
        request.get({
            url: authUrl + uuid + '/full',
            method: "GET",
            headers: {
                "Content-Type": "text/xml",
                "Authorization": "Basic YXBwcmlmdWdpQGNhaS5pdDp3YXp1eS12dXNBM2E="
            }
        }, function (err, response, body) {
            try {
                var data = JSON.parse(body);
                var role = getRole(data);
                if (role) {
                    var code = void 0;
                    if (role == enums_1.Enums.User_Type.sectional) {
                        if (data.sectionCode) {
                            code = data.sectionCode;
                        }
                    }
                    else {
                        if (data.regionaleGroupCode) {
                            var tmpCode = data.regionaleGroupCode;
                            if (tmpCode) {
                                code = tmpCode.substr(0, 2) + tmpCode.substr(5, 2) + tmpCode.substr(2, 3);
                            }
                        }
                    }
                    if (code) {
                        resolve({ role: role, code: code });
                    }
                    else {
                        reject("Error code");
                    }
                }
                else {
                    reject("User not authorized");
                }
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
function validationPromise(ticket) {
    return new Promise(function (resolve, reject) {
        request.get({
            url: casBaseUrl + "/cai-cas/serviceValidate?service=" + parsedUrl + "&ticket=" + ticket,
            method: "GET"
        }, function (err, response, body) {
            try {
                var el = (new DOMParser()).parseFromString(body, "text/xml").firstChild;
                var res = false;
                var user = void 0;
                if (getChildByName(el, 'authenticationSuccess')) {
                    res = true;
                    user = getChildByName(el, 'uuid').textContent;
                }
                if (res) {
                    resolve(user);
                }
                else {
                    reject(null);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
function toTitleCase(input) {
    if (!input) {
        return '';
    }
    else {
        return input.replace(/\w\S*/g, (function (txt) { return txt[0].toUpperCase() + txt.substr(1); })).replace(/_/g, " ");
    }
}
/**
 * QUERY
 */
function getAllIdsHead(region, section) {
    var query = {};
    if (region || section) {
        var regionQuery = void 0;
        query.$and = [];
        query.$and.push({ idCai: { '$ne': null } });
        if (region && region.length == 2) {
            regionQuery = { idCai: new RegExp("^[0-9-]{2,2}" + region + "[0-9-]{4,6}") };
            query.$and.push(regionQuery);
        }
        var sectionQuery = void 0;
        if (section && section.length == 3) {
            sectionQuery = { idCai: new RegExp("^[0-9-]{4,4}" + section + "[0-9-]{1,3}") };
            query.$and.push(sectionQuery);
        }
    }
    return new Promise(function (resolve, reject) {
        Shelters.find(query, 'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality').exec(function (err, ris) {
            if (err) {
                console.log(err);
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
        Shelters.find({}, 'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality').skip(Number(pageNumber * pageSize)).limit(Number(pageSize)).exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryFileById(id) {
    return new Promise(function (resolve, reject) {
        Files.findById(id).exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryFilesByShelterId(id) {
    return new Promise(function (resolve, reject) {
        Files.find({ "shelterId": id, type: { $not: { $in: [enums_1.Enums.File_Type.image] } } }, "name size contentType type description value").exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryImagesByShelterId(id) {
    return new Promise(function (resolve, reject) {
        Files.find({ "shelterId": id, type: enums_1.Enums.File_Type.image }, "name size contentType type description").exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryAllFiles() {
    return new Promise(function (resolve, reject) {
        Files.find({ type: { $not: { $in: [enums_1.Enums.File_Type.image] } } }, "name size contentType type description value").exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryAllImages() {
    return new Promise(function (resolve, reject) {
        Files.find({ type: enums_1.Enums.File_Type.image }, "name size contentType type description").exec(function (err, ris) {
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
        Shelters.findById(id).populate("services").exec(function (err, ris) {
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
        Shelters.findOne({ _id: id }, "name " + section).populate("services").exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
function queryShelByRegion(region, regionFilter, sectionFilter) {
    return new Promise(function (resolve, reject) {
        var query = {};
        if (region && /[0-9]{2,2}/g.test(region)) {
            region = enums_1.Enums.Region_Code[region];
        }
        if (region) {
            query['geoData.location.region'] = { $in: [region.toLowerCase(), region.toUpperCase(), toTitleCase(region), region] };
        }
        else if (regionFilter && regionFilter.length == 2) {
            var regionQuery = void 0;
            query.$and = [];
            query.$and.push({ 'idCai': { '$ne': null } });
            regionQuery = { 'idCai': new RegExp("^[0-9-]{2,2}" + regionFilter + "[0-9-]{4,6}") };
            query.$and.push(regionQuery);
            var sectionQuery = void 0;
            if (sectionFilter && sectionFilter.length == 3) {
                sectionQuery = { 'idCai': new RegExp("^[0-9-]{4,4}" + sectionFilter + "[0-9-]{1,3}") };
                query.$and.push(sectionQuery);
            }
        }
        else {
            reject({ error: "Parameter error" });
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
function queryShelAroundPoint(point, range, regionFilter, sectionFilter) {
    return new Promise(function (resolve, reject) {
        var query = {};
        query.$and = [
            { "geoData.location.latitude": { $gt: (point.lat - range), $lt: (point.lat + range) } },
            { "geoData.location.longitude": { $gt: (point.lng - range), $lt: (point.lng + range) } }
        ];
        if (regionFilter || sectionFilter) {
            query.$and.push({ 'idCai': { '$ne': null } });
            var regionQuery = void 0;
            if (regionFilter && regionFilter.length == 2) {
                regionQuery = { 'idCai': new RegExp("^[0-9-]{2,2}" + regionFilter + "[0-9-]{4,6}") };
                query.$and.push(regionQuery);
            }
            var sectionQuery = void 0;
            if (sectionFilter && sectionFilter.length == 3) {
                sectionQuery = { 'idCai': new RegExp("^[0-9-]{4,4}" + sectionFilter + "[0-9-]{1,3}") };
                query.$and.push(sectionQuery);
            }
        }
        Shelters.find(query, 'name idCai type branch owner category insertDate updateDate geoData.location.longitude geoData.location.latitude geoData.location.municipality geoData.location.region geoData.location.province').exec(function (err, ris) {
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
        Services.find(params).populate("services").exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
/**
 * INSERT
 */
function insertNewFile(file) {
    return new Promise(function (resolve, reject) {
        file.data = Buffer.from(file.data);
        Files.create(file, function (err, ris) {
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
                            if (shel.services.length == services.length) {
                                shel.save();
                                resolve(shel);
                            }
                        })["catch"](function (err) {
                            reject(err);
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
/**
 * UPDATE
 */
function updateFile(id, description) {
    return new Promise(function (resolve, reject) {
        Files.findByIdAndUpdate(id, { $set: { description: description } }).exec(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
function resolveServicesInShelter(shelter, services) {
    return new Promise(function (resolve, reject) {
        if (services) {
            var count_1 = 0;
            for (var _i = 0, services_2 = services; _i < services_2.length; _i++) {
                var serv = services_2[_i];
                var c = 0;
                for (var k in serv) {
                    if (serv.hasOwnProperty(k)) {
                        ++c;
                    }
                }
                if (serv.hasOwnProperty("_id") && c == 1) {
                    deleteService(serv._id)
                        .then(function () {
                        count_1++;
                        if (count_1 == services.length) {
                            shelter.save();
                            resolve(shelter);
                        }
                    })["catch"](function (err) {
                        reject(err);
                    });
                }
                else {
                    if (serv._id) {
                        updateService(serv._id, serv)
                            .then(function () {
                            count_1++;
                            if (count_1 == services.length) {
                                shelter.save();
                                resolve(shelter);
                            }
                        })["catch"](function (err) {
                            reject(err);
                        });
                    }
                    else {
                        insertNewService(serv)
                            .then(function (ser) {
                            shelter.services.push(ser._id);
                            count_1++;
                            if (count_1 == services.length) {
                                shelter.save();
                                resolve(shelter);
                            }
                        })["catch"](function (err) {
                            reject(err);
                        });
                    }
                }
            }
        }
        else {
            resolve(shelter);
        }
    });
}
function resolveEconomyInShelter(shelter, uses, contributions, economies) {
    return new Promise(function (resolve, reject) {
        try {
            if (uses != undefined) {
                var _loop_1 = function (use) {
                    var u = shelter.use.findIndex(function (obj) { return obj.year == use.year; });
                    if (u > -1) {
                        shelter.use.splice(u, 1);
                    }
                    shelter.use.push(use);
                };
                for (var _i = 0, uses_1 = uses; _i < uses_1.length; _i++) {
                    var use = uses_1[_i];
                    _loop_1(use);
                }
            }
            if (economies != undefined) {
                var _loop_2 = function (economy) {
                    var e = shelter.economy.findIndex(function (obj) { return obj.year == economy.year; });
                    if (e > -1) {
                        shelter.economy.splice(e, 1);
                    }
                    shelter.economy.push(economy);
                };
                for (var _a = 0, economies_1 = economies; _a < economies_1.length; _a++) {
                    var economy = economies_1[_a];
                    _loop_2(economy);
                }
            }
            //////////////// contributions
            resolve(shelter);
        }
        catch (e) {
            reject(e);
        }
    });
}
function updateShelter(id, params) {
    return new Promise(function (resolve, reject) {
        var services = params.services;
        var use = params.use;
        var contributions = params.contributions;
        var economy = params.economy;
        delete (params.services);
        delete (params.use);
        delete (params.economy);
        delete (params.contributions);
        var options = { setDefaultsOnInsert: true, upsert: true };
        if (params.updateDate == undefined) {
            params.updateDate = new Date(Date.now());
        }
        Shelters.findByIdAndUpdate(id, { $set: params }, options, function (err, shel) {
            if (err) {
                reject(err);
            }
            else {
                resolveServicesInShelter(shel, services)
                    .then(function (shelter) {
                    resolveEconomyInShelter(shelter, use, contributions, economy)
                        .then(function (shelter) {
                        shelter.save();
                        resolve(true);
                    })["catch"](function (err) {
                        reject(err);
                    });
                })["catch"](function (err) {
                    reject(err);
                });
            }
        });
    });
}
function confirmShelter(id) {
    return new Promise(function (resolve, reject) {
        var shelToUpdate = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == id; })[0];
        if (shelToUpdate.shelter.name != null) {
            updateShelter(id, shelToUpdate.shelter)
                .then(function () {
                SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToUpdate), 1);
                resolve(true);
            })["catch"](function (err) {
                reject(err);
            });
        }
        else {
            resolve(true);
        }
    });
}
function addOpening(id, opening) {
    return new Promise(function (resolve, reject) {
        Shelters.findById(id, 'openingTime', function (err, shelter) {
            if (err)
                reject(err);
            else {
                shelter.openingTime.push(opening);
                shelter.save(function (err) {
                    if (err) {
                        reject(err);
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
/**
 * DELETE
 */
function deleteFile(id) {
    return new Promise(function (resolve, reject) {
        if (id) {
            Files.remove({ _id: id }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        }
        else {
            reject(new Error("Invalid id"));
        }
    });
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
            reject(new Error("Invalid id"));
        }
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
            })["catch"](function (err) {
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
function cleanSheltersToUpdate() {
    if (!stop) {
        stop = true;
        SheltersToUpdate.forEach(function (obj) {
            var diff = Date.now() - obj.watchDog.valueOf();
            if (diff > maxTime) {
                SheltersToUpdate.splice(SheltersToUpdate.indexOf(obj), 1);
            }
        });
        stop = false;
    }
}
/**
 * APP SETUP
 */
function checkPermissionAppAPI(req, res, next) {
    var user = req.body.user;
    if (user) {
        if (req.method == "GET") {
            next();
        }
        else {
            if (req.method == "DELETE" || req.method == "POST") {
                if (user.role == enums_1.Enums.User_Type.central) {
                    next();
                }
                else {
                    res.status(500).send({ error: "Unauthorized" });
                }
            }
            else if (req.method == "PUT") {
                if (enums_1.Enums.DetailRevisionPermission.find(function (obj) { return obj == user.role; })) {
                    next();
                }
                else {
                    res.status(500).send({ error: "Unauthorized" });
                }
            }
            else {
                res.status(501).send({ error: "Not Implemented method " + req.method });
            }
        }
    }
    else {
        res.status(500).send({ error: "Error request" });
    }
}
function checkPermissionFileAPI(req, res, next) {
    var user = req.body.user;
    if (user) {
        if (req.method == "GET") {
            next();
        }
        else {
            if (req.method == "DELETE" || req.method == "POST" || req.method == "PUT") {
                if (enums_1.Enums.DocRevisionPermission.find(function (obj) { return obj == user.role; })) {
                    next();
                }
                else {
                    res.status(500).send({ error: "Unauthorized" });
                }
            }
            else {
                res.status(501).send({ error: "Not Implemented method " + req.method });
            }
        }
    }
    else {
        res.status(500).send({ error: "Error request" });
    }
}
var app = express();
var appRoute = express.Router();
appRoute.all("*", checkPermissionAppAPI);
var fileRoute = express.Router();
fileRoute.all("*", checkPermissionFileAPI);
var authRoute = express.Router();
setInterval(cleanSheltersToUpdate, 1500);
/**
 * ROUTE SECTION
 */
fileRoute.route("/shelters/file")
    .post(function (req, res) {
    var upload = multer().single("file");
    upload(req, res, function (err) {
        if (err) {
            res.status(500).send({ error: "Error in file upload" });
        }
        else {
            stop = true;
            var file = JSON.parse(req.file.buffer.toString());
            if (file.size < 1024 * 1024 * 16) {
                insertNewFile(file)
                    .then(function (file) {
                    res.status(200).send({ _id: file._id, name: file.name, size: file.size, type: file.type, contentType: file.contentType });
                })["catch"](function (err) {
                    res.status(500).send(err);
                });
            }
        }
    });
});
fileRoute.route("/shelters/file/all")
    .get(function (req, res) {
    queryAllFiles()
        .then(function (file) {
        res.status(200).send(file);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
});
fileRoute.route("/shelters/image/all")
    .get(function (req, res) {
    queryAllImages()
        .then(function (file) {
        res.status(200).send(file);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
});
fileRoute.route("/shelters/file/confirm")
    .post(function (req, res) {
    try {
        var upload = multer().single("file");
        upload(req, res, function (err) {
            if (err) {
                res.status(500).send({ error: "Error in file upload" });
            }
            else {
                stop = true;
                var file_1 = JSON.parse(req.file.buffer.toString());
                if (file_1.size < 1024 * 1024 * 16) {
                    var id_1 = file_1.shelterId;
                    var fileId_1 = new ObjectId();
                    var shelUpdate_1 = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == id_1; });
                    file_1._id = fileId_1;
                    file_1["new"] = true;
                    if (file_1.type == enums_1.Enums.File_Type.image) {
                        var shelFiles = queryFilesByShelterId(id_1)
                            .then(function (files) {
                            if (shelUpdate_1 != undefined && shelUpdate_1.length > 0) {
                                if (files.length < maxImages && (shelUpdate_1[0].files == undefined || files.length + shelUpdate_1[0].files.length < maxImages)) {
                                    if (shelUpdate_1[0].files != undefined) {
                                        shelUpdate_1[0].files.push(file_1);
                                    }
                                    else {
                                        shelUpdate_1[0].files = [file_1];
                                    }
                                    shelUpdate_1[0].watchDog = new Date(Date.now());
                                    res.status(200).send(fileId_1);
                                }
                                else {
                                    res.status(500).send({ error: "Max " + maxImages + " images" });
                                }
                            }
                            else {
                                if (files.length < maxImages) {
                                    var newShelter = { _id: id_1 };
                                    SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [file_1] });
                                    res.status(200).send(fileId_1);
                                }
                                else {
                                    res.status(500).send({ error: "Max " + maxImages + " images" });
                                }
                            }
                            stop = false;
                        })["catch"](function (err) {
                            if (shelUpdate_1 != undefined && shelUpdate_1.length > 0) {
                                if (shelUpdate_1[0].files == undefined || shelUpdate_1[0].files.length < maxImages) {
                                    if (shelUpdate_1[0].files != undefined) {
                                        shelUpdate_1[0].files.push(file_1);
                                    }
                                    else {
                                        shelUpdate_1[0].files = [file_1];
                                    }
                                    shelUpdate_1[0].watchDog = new Date(Date.now());
                                    res.status(200).send(fileId_1);
                                }
                                else {
                                    res.status(500).send({ error: "Max " + maxImages + " images" });
                                }
                            }
                            else {
                                var newShelter = { _id: id_1 };
                                SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [file_1] });
                                res.status(200).send(fileId_1);
                            }
                            stop = false;
                        });
                    }
                    else {
                        if (shelUpdate_1 != undefined && shelUpdate_1.length > 0) {
                            if (shelUpdate_1[0].files != undefined) {
                                shelUpdate_1[0].files.push(file_1);
                            }
                            else {
                                shelUpdate_1[0].files = [file_1];
                            }
                            shelUpdate_1[0].watchDog = new Date(Date.now());
                        }
                        else {
                            var newShelter = { _id: id_1 };
                            SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [file_1] });
                        }
                        stop = false;
                        res.status(200).send(fileId_1);
                    }
                }
                else {
                    res.status(500).send({ error: "File size over limit" });
                }
            }
        });
    }
    catch (e) {
        res.status(500).send({ error: "Error undefined" });
    }
});
fileRoute.route("/shelters/file/confirm/:fileId/:shelId")["delete"](function (req, res) {
    var shelUpdate = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == req.params.shelId; });
    if (shelUpdate != undefined && shelUpdate.length > 0) {
        var fileToDelete = shelUpdate[0].files.filter(function (f) { return f._id == req.params.fileId; });
        if (fileToDelete != undefined && fileToDelete.length > 0) {
            shelUpdate[0].files.splice(shelUpdate[0].files.indexOf(fileToDelete[0]), 1);
            delete (fileToDelete[0].data);
            fileToDelete[0].remove = true;
        }
        else {
            shelUpdate[0].files.push({ _id: req.params.fileId, remove: true });
        }
        res.status(200).send(true);
    }
    else {
        var newShelter = {};
        newShelter._id = req.params.shelId;
        SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [{ _id: req.params.fileId, remove: true }] });
        res.status(200).send(true);
    }
});
fileRoute.route("/shelters/file/:id")
    .get(function (req, res) {
    queryFileById(req.params.id)
        .then(function (file) {
        res.status(200).send(file);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
})
    .put(function (req, res) {
    var shel = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == req.body.shelId; })[0];
    if (shel != undefined) {
        var file = shel.files.filter(function (f) { return f._id == req.params.id; })[0];
        if (file != undefined) {
            file.description = req.body.description;
        }
        else {
            shel.files.push({ _id: req.params.id, description: req.body.description, update: true });
        }
    }
    else {
        var shelter = { _id: req.body.shelId };
        SheltersToUpdate.push({
            watchDog: new Date(Date.now()),
            shelter: shelter,
            files: [{ _id: req.params.id, description: req.body.description, update: true }]
        });
    }
    res.status(200).send(true);
})["delete"](function (req, res) {
    deleteFile(req.params.id)
        .then(function () {
        res.status(200).send(true);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
});
appRoute.route("/shelters/file/byshel/:id")
    .get(function (req, res) {
    var shel = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == req.params.id; })[0];
    if (shel == undefined) {
        queryFilesByShelterId(req.params.id)
            .then(function (file) {
            res.status(200).send(file);
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
    else {
        queryFilesByShelterId(req.params.id)
            .then(function (file) {
            if (shel.files != null) {
                var _loop_3 = function (f) {
                    if (f.remove) {
                        var fi = file.filter(function (file) { return file._id == f._id; })[0];
                        file.splice(file.indexOf(fi), 1);
                    }
                    else if (f["new"]) {
                        file.push(f);
                    }
                    else {
                        var fi = file.filter(function (file) { return file._id == f._id; })[0];
                        file[file.indexOf(fi)] = f;
                    }
                };
                for (var _i = 0, _a = shel.files.filter(function (f) { return f.type != enums_1.Enums.File_Type.image; }); _i < _a.length; _i++) {
                    var f = _a[_i];
                    _loop_3(f);
                }
                res.status(200).send(file);
            }
            else {
                res.status(200).send(file);
            }
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
});
appRoute.route("/shelters/image/byshel/:id")
    .get(function (req, res) {
    var shel = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == req.params.id; })[0];
    if (shel == undefined) {
        queryImagesByShelterId(req.params.id)
            .then(function (file) {
            res.status(200).send(file);
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
    else {
        queryImagesByShelterId(req.params.id)
            .then(function (file) {
            if (shel.files != null) {
                var _loop_4 = function (f) {
                    if (f.remove) {
                        var fi = file.filter(function (file) { return file._id == f._id; })[0];
                        file.splice(file.indexOf(fi), 1);
                    }
                    else if (f["new"]) {
                        file.push(f);
                    }
                    else {
                        var fi = file.filter(function (file) { return file._id == f._id; })[0];
                        file[file.indexOf(fi)] = f;
                    }
                };
                for (var _i = 0, _a = shel.files.filter(function (f) { return f.type == enums_1.Enums.File_Type.image; }); _i < _a.length; _i++) {
                    var f = _a[_i];
                    _loop_4(f);
                }
                res.status(200).send(file);
            }
            else {
                res.status(200).send(file);
            }
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
});
appRoute.route("/shelters")
    .get(function (req, res) {
    try {
        getAllIdsHead(req.query.region, req.query.section)
            .then(function (rif) {
            if (rif) {
                res.status(200).send(rif);
            }
            else {
                res.status(404).send({ error: "No Matcching Rifugio" });
            }
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
})
    .post(function (req, res) {
    insertNewShelter(req.body)
        .then(function (shelter) {
        var id = shelter._id;
        delete (shelter._id);
        res.status(200).send({ id: id, shelter: shelter });
    })["catch"](function (err) {
        res.status(500).send(err);
    });
});
appRoute.route("/shelters/country")
    .get(function (req, res) {
    try {
        if (req.query.name || req.query.region) {
            queryShelByRegion(req.query.name, req.query.region, req.query.section)
                .then(function (ris) {
                res.status(200).send({ num: ris });
            })["catch"](function (err) {
                console.log(err);
                res.status(500).send(err);
            });
        }
        else {
            res.status(500).send({ error: "Error parameters" });
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ error: "Error Undefined" });
    }
});
appRoute.route("/shelters/point")
    .get(function (req, res) {
    try {
        if (req.query.lat && req.query.lng && req.query.range) {
            queryShelAroundPoint({ lat: Number(req.query.lat), lng: Number(req.query.lng) }, Number(req.query.range), req.query.region, req.query.section)
                .then(function (ris) {
                res.status(200).send(ris);
            })["catch"](function (err) {
                res.status(500).send(err);
            });
        }
        else {
            res.status(500).send({ error: "Query error, parameters not found" });
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ error: "Error Undefined" });
    }
});
appRoute.route("/shelters/:id")
    .get(function (req, res) {
    try {
        if (ObjectId.isValid(req.params.id)) {
            queryShelById(req.params.id)
                .then(function (rif) {
                if (rif != null) {
                    res.status(200).send(rif);
                }
                else {
                    res.status(200).send({ _id: req.params.id });
                }
            })["catch"](function (err) {
                res.status(500).send(err);
            });
        }
        else {
            res.status(500).send({ error: "Error ID" });
        }
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
})
    .put(function (req, res) {
    var shelUpdate = SheltersToUpdate.filter(function (shelter) { return shelter.shelter._id == req.params.id; });
    if (shelUpdate.length > 0) {
        for (var param in req.body) {
            if (shelUpdate[0].shelter.hasOwnProperty(param)) {
                shelUpdate[0].shelter[param] = req.body[param];
            }
        }
        shelUpdate[0].watchDog = new Date(Date.now());
    }
    updateShelter(req.params.id, req.body)
        .then(function () {
        res.status(200).send(true);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
})["delete"](function (req, res) {
    deleteShelter(req.params.id)
        .then(function () {
        res.status(200).send(true);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
});
appRoute.route("/shelters/confirm/:id")
    .put(function (req, res) {
    try {
        if (req.body.confirm != undefined) {
            var shelToConfirm_1 = SheltersToUpdate.filter(function (shelter) { return shelter.shelter._id == req.params.id; })[0];
            if (shelToConfirm_1 != undefined) {
                if (req.body.confirm) {
                    confirmShelter(req.params.id)
                        .then(function (ris) {
                        if (shelToConfirm_1.files != null) {
                            var i_1 = shelToConfirm_1.files.length;
                            var j_1 = 0;
                            for (var _i = 0, _a = shelToConfirm_1.files; _i < _a.length; _i++) {
                                var file = _a[_i];
                                if (file.remove != undefined && file.remove) {
                                    deleteFile(file._id)
                                        .then(function () {
                                        j_1++;
                                        if (j_1 == i_1) {
                                            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm_1), 1);
                                            res.status(200).send(true);
                                        }
                                    })["catch"](function (err) {
                                        res.status(500).send(err);
                                    });
                                }
                                else {
                                    if (!file["new"] && file.update != undefined && file.update) {
                                        updateFile(file._id, file.description)
                                            .then(function (value) {
                                            j_1++;
                                            if (j_1 == i_1) {
                                                SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm_1), 1);
                                                res.status(200).send(true);
                                            }
                                        })["catch"](function (err) {
                                            res.status(500).send(err);
                                        });
                                    }
                                    else {
                                        insertNewFile(file)
                                            .then(function (f) {
                                            j_1++;
                                            if (j_1 == i_1) {
                                                SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm_1), 1);
                                                res.status(200).send(true);
                                            }
                                        })["catch"](function (err) {
                                            res.status(500).send(err);
                                        });
                                    }
                                }
                            }
                        }
                        else {
                            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm_1), 1);
                            res.status(200).send(true);
                        }
                    })["catch"](function (err) {
                        res.status(500).send(err);
                    });
                }
                else {
                    SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm_1), 1);
                    res.status(200).send(true);
                }
            }
            else {
                res.status(200).send(true);
            }
        }
        if (req.body["new"] != undefined) {
            if (req.body["new"]) {
                res.status(200).send({ id: new ObjectId() });
            }
            else {
                res.status(500).send({ error: "command not found" });
            }
        }
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
});
appRoute.route("/shelters/confirm/:section/:id")
    .put(function (req, res) {
    try {
        stop = true;
        var shelUpdate = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == req.params.id; });
        if (shelUpdate.length > 0) {
            shelUpdate[0].shelter[req.params.section] = req.body[req.params.section];
            shelUpdate[0].watchDog = new Date(Date.now());
        }
        else {
            var newShelter = req.body;
            newShelter._id = req.params.id;
            SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: null });
        }
        stop = false;
        res.status(200).send(true);
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
});
appRoute.route("/shelters/page/:pageSize")
    .get(function (req, res) {
    try {
        queryShelPage(0, req.params.pageSize)
            .then(function (ris) {
            res.status(200).send(ris);
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
});
appRoute.route("/shelters/page/:pageNumber/:pageSize")
    .get(function (req, res) {
    try {
        queryShelPage(req.params.pageNumber, req.params.pageSize)
            .then(function (ris) {
            res.status(200).send(ris);
        })["catch"](function (err) {
            res.status(500).send(err);
        });
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
});
appRoute.route("/shelters/:id/:name")
    .get(function (req, res) {
    try {
        stop = true;
        var shelUpdate = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == req.params.id; });
        if (shelUpdate.length > 0 && shelUpdate[0].shelter[req.params.name] != undefined) {
            shelUpdate[0].watchDog = new Date(Date.now());
            res.status(200).send(shelUpdate[0].shelter);
            stop = false;
        }
        else {
            queryShelSectionById(req.params.id, req.params.name)
                .then(function (ris) {
                if (ris != null) {
                    res.status(200).send(ris);
                }
                else {
                    res.status(200).send({ _id: req.params.id });
                    //res.status(404).send(ris);
                }
            })["catch"](function (err) {
                res.status(500).send(err);
            });
        }
    }
    catch (e) {
        res.status(500).send({ error: "Error Undefined" });
    }
})["delete"](function (req, res) {
    deleteService(req.params.name)
        .then(function () {
        res.status(200).send(true);
    })["catch"](function (err) {
        res.status(500).send(err);
    });
});
/** AUTH INIT */
authRoute.get('/logout', function (req, res) {
    var user = userList.findIndex(function (obj) { return obj.id == req.session.id; });
    console.log("Logging out");
    if (user > -1) {
        userList.splice(user, 1);
    }
    res.redirect(casBaseUrl + "/cai-cas/logout");
});
authRoute.get('/j_spring_cas_security_check', function (req, res) {
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (user) {
        user.ticket = req.query.ticket;
        res.redirect(user.resource.toString());
    }
    else {
        console.log("Invalid user request");
        userList.push({ id: req.session.id, resource: appBaseUrl, redirections: 0, checked: false });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
});
authRoute.get('/user', function (req, res, next) {
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    console.log("User permissions request (UUID): ", user.uuid);
    if (user != undefined && user.uuid != undefined) {
        if (user.code == undefined || user.role == undefined) {
            if (user.checked) {
                user.checked = false;
                res.status(500).send({ error: "Invalid user or request" });
            }
            else {
                checkUserPromise(user.uuid)
                    .then(function (usr) {
                    user.code = usr.code;
                    user.role = usr.role;
                    res.status(200).send(usr);
                })["catch"](function () {
                    res.status(500).send({ error: "Invalid user or request" });
                });
            }
        }
        else {
            res.status(200).send({ code: user.code, role: user.role });
        }
    }
    else {
        console.log("User not logged");
        userList.push({ id: req.session.id, resource: appBaseUrl + '/list', redirections: 0, checked: false });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
});
authRoute.get('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect("/list");
});
authRoute.use(express.static(__dirname + '/dist'));
authRoute.get('/*', function (req, res) {
    console.log(req.method + " REQUEST: " + JSON.stringify(req.query));
    console.log(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (!user) {
        console.log("User not logged");
        userList.push({ id: req.session.id, resource: req.path, redirections: 0, checked: false });
        res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
    }
    else {
        if (user.ticket) {
            console.log("Checking ticket: ", user.ticket);
            validationPromise(user.ticket)
                .then(function (usr) {
                console.log("Valid ticket");
                user.checked = true;
                user.redirections = 0;
                if (user.code == undefined || user.role == undefined) {
                    user.uuid = usr;
                    checkUserPromise(usr)
                        .then(function (us) {
                        console.log("Access granted with role and code: ", enums_1.Enums.User_Type[us.role], us.code);
                        user.code = us.code;
                        user.role = us.role;
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                    })["catch"](function () {
                        console.log("Access denied");
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                    });
                }
                else {
                    if (user.role) {
                        console.log("Access granted with role and code: ", user.role, user.code);
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                    }
                    else {
                        res.sendFile(path.join(__dirname + '/dist/index.html'));
                    }
                }
            })["catch"](function (err) {
                console.log("Invalid ticket");
                user.redirections++;
                user.checked = false;
                user.resource = req.path;
                if (user.redirections >= 3) {
                    var index = userList.findIndex(function (obj) { return obj.id == user.id; });
                    userList.splice(index, 1);
                    res.status(500).send("Error, try logout <a href='" + casBaseUrl + "/cai-cas/logout" + "'>here</a> before try again.\n                <br>Error info:<br><br>" + err);
                }
                else {
                    res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
                }
            });
        }
        else {
            console.log("Invalid user ticket");
            user.resource = req.path;
            user.redirections++;
            if (user.redirections >= 3) {
                var index = userList.findIndex(function (obj) { return obj.id == user.id; });
                userList.splice(index, 1);
                res.status(500).send("Error, try logout <a href='" + casBaseUrl + "/cai-cas/logout" + "'>here</a> before try again");
            }
            else {
                res.redirect(casBaseUrl + "/cai-cas/login?service=" + parsedUrl);
            }
        }
    }
});
/**
 * APP INIT
 */
app.use(bodyParser.urlencoded({
    extended: true
}), session({
    secret: 'ytdv6w4a2wzesdc7564uybi6n0m9pmku4esx',
    resave: false,
    saveUninitialized: true
}), bodyParser.json());
app.use('/api', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('content-type', 'application/json; charset=utf-8');
    var user = userList.find(function (obj) { return obj.id == req.session.id; });
    if (user != undefined && user.checked && user.role != undefined && user.code != undefined) {
        req.body.user = user;
        next();
    }
    else {
        res.status(500).send({ error: "Unauthenticated user" });
    }
}, fileRoute, appRoute);
app.use('/', authRoute);
/*
var sslkey = fs.readFileSync('ssl-key.pem');
var sslcert = fs.readFileSync('ssl-cert.pem')

var options = {
    key: sslkey,
    cert: sslcert
};

var server = https.createServer(options, app);

server.listen(process.env.PORT || appPort, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});*/
var server = app.listen(process.env.PORT || appPort, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ProvaDB", function (err) {
    if (err) {
        console.log("Error connection: " + err);
        server.close(function () {
            console.log("Server Closed");
            process.exit(-1);
            return;
        });
    }
});
