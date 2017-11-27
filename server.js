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
var pdf = require("html-pdf");
mongoose.Promise = global.Promise;
var appPort = 8000;
var months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
var ObjectId = mongoose.Types.ObjectId;
var Services = mongoose.model("Services", schema_1.Schema.serviceSchema);
var Shelters = mongoose.model("Shelters", schema_1.Schema.shelterSchema);
var Files = mongoose.model("Files", schema_1.Schema.fileSchema);
var SheltersToUpdate = [];
var Users = [];
var maxTime = 1000 * 60 * 10;
var stop = false;
var maxImages = 10;
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
function countContributionFilesByShelter(shelID) {
    return new Promise(function (resolve, reject) {
        Files.count({ "shelterId": shelID, type: enums_1.Enums.File_Type.contribution }).exec(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}
function queryFilesByShelterId(id) {
    return new Promise(function (resolve, reject) {
        Files.find({ "shelterId": id, type: { $not: { $in: [enums_1.Enums.File_Type.image] } } }, "name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type").exec(function (err, ris) {
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
        Files.find({ type: { $not: { $in: [enums_1.Enums.File_Type.image] } } }, "name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type").exec(function (err, ris) {
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
function updateFile(id, file) {
    return new Promise(function (resolve, reject) {
        var query = {
            $set: {
                contribution_type: file.contribution_type || null,
                invoice_year: file.invoice_year || null,
                invoice_tax: file.invoice_tax || null,
                invoice_type: file.invoice_type || null,
                invoice_confirmed: file.invoice_confirmed || null,
                value: file.value || null,
                description: file.description || null
            }
        };
        Files.findByIdAndUpdate(id, query).exec(function (err, res) {
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
function getContributionHtml(title, value, rightTitle) {
    if (value == null)
        value = 0;
    if (rightTitle) {
        return "<div style='max-width:65%'><div align='right' style='font-weight:bold'>" + title + " (€): " + value + "</div></div>";
    }
    else {
        return "<div style='max-width:65%'><div style='display:inline' align='left'>" + title + "</div><div style='display:inline;float:right'>(€): " + value + "</div></div>";
    }
}
function createPDF(shelter) {
    if (shelter && shelter.branch && shelter.contributions && shelter.contributions.data) {
        var contribution_1 = shelter.contributions;
        var title_1 = "24px";
        var subtitle_1 = "20px";
        var body_1 = "16px";
        return new Promise(function (resolve, reject) {
            var assestpath = path.join("file://" + __dirname + "/src/assets/images/");
            var header = "<div style=\"text-align:center\">\n            <div style=\"height:100px\"><img style=\"max-width:100%;max-height:100%\" src=\"" + assestpath + "logo_pdf.png\" /></div>\n            <div style=\"font-weight: bold;font-size:" + title_1 + "\">CLUB ALPINO ITALIANO</div>\n            </div>";
            var document = "<html><head></head><body>" + header + "\n            <br/><div style=\"font-size:" + body_1 + "\" align='right'><span style='text-align:left'>Spett.<br/>Club Alpino Italiano<br/>Commissione rifugi<br/><span></div><br/>\n            <div style=\"font-weight: bold;font-size:" + title_1 + "\">Oggetto: Richiesta di contributi di tipo " + contribution_1.type + " Rifugi</div><br/>\n            <div style=\"font-weight: 400;font-size:" + title_1 + "\">Con la presente vi comunico che la Sezione di " + shelter.branch + " intende svolgere nel \n            " + (contribution_1.year + 1) + " i lavori di manutenzione in seguito descritti,\n            predisponendo un piano economico cos\u00EC suddiviso:</div><br/>";
            document += "<div style='font-weight:400;font-size:" + subtitle_1 + "'>";
            document += getContributionHtml("Lavori a corpo", contribution_1.data.handWorks);
            document += getContributionHtml("Lavori a misura", contribution_1.data.customizedWorks);
            document += getContributionHtml("Oneri di sicurezza", contribution_1.data.safetyCharges);
            document += getContributionHtml("Totale Lavori", contribution_1.data.totWorks, true);
            document += "<br/>";
            document += getContributionHtml("Spese per indagini, rilievi, ecc.", contribution_1.data.surveyorsCharges);
            document += getContributionHtml("Spese per allacciamenti a reti di distribuzione", contribution_1.data.connectionsCharges);
            document += getContributionHtml("Spese tecniche", contribution_1.data.technicalCharges);
            document += getContributionHtml("Spese di collaudo", contribution_1.data.testCharges);
            document += getContributionHtml("Tasse ed Oneri", contribution_1.data.taxes);
            document += getContributionHtml("Totale Spese", contribution_1.data.totCharges, true);
            document += "<br/>";
            if (contribution_1.data.IVAincluded) {
                document += "<div>IVA compresa poiché non recuperabile</div>";
            }
            document += getContributionHtml("Costo totale del progetto", contribution_1.data.totalProjectCost);
            document += getContributionHtml("Finanziamento esterno", contribution_1.data.externalFinancing);
            document += getContributionHtml("Autofinanziamento", contribution_1.data.selfFinancing);
            document += getContributionHtml("Scoperto", contribution_1.data.red);
            document += "</div><br/>";
            document += "<div style=\"font-size:" + title_1 + "\"><div>Vi richiediamo un contributo di euro (\u20AC): " + contribution_1.value + "</div><br/>\n            <div>Fiduciosi in un positivo accoglimento, con la presente ci \u00E8 gradito porgere i nostri pi\u00F9 cordiali saluti.</div></div><br/><br/>";
            var now = new Date(Date.now());
            document += "<div style=\"font-size:" + title_1 + "\"><div style='display:inline' align='left'>" + (now.getDay() + "/" + (months[now.getMonth()]) + "/" + now.getFullYear()) + "</div>\n            <div style='display:inline;float:right'><div style=\"text-align:center\">Il Presidente della Sezione di " + shelter.branch + "</div></div></div>";
            var footer = "";
            if (contribution_1.attachments && contribution_1.attachments.length > 0) {
                footer += "<div style='font-size:" + subtitle_1 + "'><div style='font-weight:bold'>Allegati:<div>";
                contribution_1.attachments.forEach(function (file) {
                    footer += "<div style='font-weight:400'>" + file.name + "</div>";
                });
                footer += "</div>";
            }
            document += "</body></html>";
            var result = pdf.create(document, {
                "directory": "/tmp",
                "border": {
                    "top": "0.3in",
                    "left": "0.6in",
                    "bottom": "0.3in",
                    "right": "0.6in"
                },
                "footer": {
                    "contents": footer
                }
            });
            /*result.toFile("./doc.pdf",function(err,res){
                resolve(null);
            });*/
            result.toStream(function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    countContributionFilesByShelter(shelter._id)
                        .then(function (num) {
                        var bufs = [];
                        num += 1;
                        res.on('data', function (d) { bufs.push(d); });
                        res.on("end", function () {
                            var buff = Buffer.concat(bufs);
                            var file = {
                                size: buff.length,
                                shelterId: shelter._id,
                                uploadDate: new Date(),
                                name: contribution_1.year + "_" + contribution_1.type + "_" + num + ".pdf",
                                data: buff,
                                contribution_type: contribution_1.type,
                                contentType: "application/pdf",
                                type: enums_1.Enums.File_Type.contribution,
                                invoice_year: contribution_1.year,
                                value: contribution_1.value
                            };
                            insertNewFile(file)
                                .then(function (f) {
                                resolve({ name: f.name, id: f._id });
                            })["catch"](function (err) {
                                reject(err);
                            });
                        });
                        res.on('error', function (err) {
                            reject(err);
                        });
                    })["catch"](function (err) {
                        reject(err);
                    });
                }
            });
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            reject(new Error("Error contribution data"));
        });
    }
}
function resolveEconomyInShelter(shelter, uses, contributions, economies) {
    return new Promise(function (resolve, reject) {
        try {
            if (uses != undefined) {
                var _loop_1 = function (use) {
                    var u = shelter.use.filter(function (obj) { return obj.year == use.year; })[0];
                    if (u != undefined) {
                        shelter.use.splice(shelter.use.indexOf(u), 1);
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
                    var e = shelter.economy.filter(function (obj) { return obj.year == economy.year; })[0];
                    if (e != undefined) {
                        shelter.economy.splice(shelter.economy.indexOf(e), 1);
                    }
                    shelter.economy.push(economy);
                };
                for (var _a = 0, economies_1 = economies; _a < economies_1.length; _a++) {
                    var economy = economies_1[_a];
                    _loop_2(economy);
                }
            }
            if (contributions != undefined) {
                shelter.contributions = contributions;
                if (contributions.accepted) {
                    createPDF(shelter)
                        .then(function (file) {
                        delete (shelter.contributions);
                        resolve(shelter);
                    })["catch"](function (e) {
                        reject(e);
                    });
                }
                else {
                    resolve(shelter);
                }
            }
            else {
                resolve(shelter);
            }
        }
        catch (e) {
            reject(e);
        }
    });
}
function updateShelter(id, params, isNew) {
    return new Promise(function (resolve, reject) {
        try {
            var services_3 = params.services;
            var use_1 = params.use;
            var contributions_1 = params.contributions;
            var economy_1 = params.economy;
            delete (params.services);
            delete (params.use);
            delete (params.economy);
            //delete(params.contributions);
            var options = { upsert: isNew || false, "new": true };
            if (params.updateDate == undefined) {
                params.updateDate = new Date(Date.now());
            }
            Shelters.findByIdAndUpdate(id, { $set: params }, options, function (err, shel) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    for (var prop in shel) {
                        if (Object.getPrototypeOf(shel).hasOwnProperty(prop)) {
                            if (Object.getPrototypeOf(params).hasOwnProperty(prop)) {
                                shel[prop] = undefined;
                            }
                            else if (shel[prop] == null) {
                                shel[prop] = undefined;
                            }
                        }
                    }
                    resolveServicesInShelter(shel, services_3)
                        .then(function (shelter) {
                        resolveEconomyInShelter(shelter, use_1, contributions_1, economy_1)
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
        }
        catch (e) {
            reject(e);
        }
    });
}
function confirmShelter(id) {
    return new Promise(function (resolve, reject) {
        var shelToUpdate = SheltersToUpdate.filter(function (obj) { return obj.shelter._id == id; })[0];
        updateShelter(id, shelToUpdate.shelter)
            .then(function () {
            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToUpdate), 1);
            resolve(true);
        })["catch"](function (err) {
            reject(err);
        });
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
var app = express();
var appRoute = express.Router();
var fileRoute = express.Router();
setInterval(cleanSheltersToUpdate, 1500);
//setInterval(cleanLoggedUsers,1500);
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
                            var images = files.filter(function (obj) { return obj.type == enums_1.Enums.File_Type.image; });
                            if (shelUpdate_1 != undefined && shelUpdate_1.length > 0) {
                                if (images.length < maxImages && (shelUpdate_1[0].files == undefined || images.length + shelUpdate_1[0].files.length < maxImages)) {
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
                                if (images.length < maxImages) {
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
    try {
        var updFile_1 = req.body.file;
        if (updFile_1) {
            var shel = SheltersToUpdate.filter(function (obj) { return obj.shelter._id && obj.shelter._id == updFile_1.shelterId; })[0];
            if (shel != undefined) {
                var file = shel.files.filter(function (f) { return f._id == req.params.id; })[0];
                if (file != undefined) {
                    for (var prop in updFile_1) {
                        file[prop] = updFile_1[prop];
                    }
                    file.update = true;
                }
                else {
                    var newF = {};
                    for (var prop in updFile_1) {
                        newF[prop] = updFile_1[prop];
                    }
                    newF.update = true;
                    shel.files.push(newF);
                }
            }
            else {
                var shelter = { _id: updFile_1.shelterId };
                var newF = {};
                for (var prop in updFile_1) {
                    newF[prop] = updFile_1[prop];
                }
                newF.update = true;
                SheltersToUpdate.push({
                    watchDog: new Date(Date.now()),
                    shelter: shelter,
                    files: [newF]
                });
            }
            res.status(200).send(true);
        }
        else {
            res.status(500).send({ error: "Incorrect request" });
        }
    }
    catch (e) {
        res.status(500).send({ error: e });
    }
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
    var shelUpdate;
    if (req.query.confirm) {
        stop = true;
        shelUpdate = SheltersToUpdate.filter(function (shelter) { return shelter.shelter._id == req.params.id; })[0];
        if (shelUpdate != undefined) {
            for (var param in req.body) {
                if (shelUpdate.shelter.hasOwnProperty(param)) {
                    shelUpdate.shelter[param] = req.body[param];
                }
            }
            shelUpdate.watchDog = new Date(Date.now());
        }
        else {
            var newShelter = req.body;
            newShelter._id = req.params.id;
            shelUpdate = { watchDog: new Date(Date.now()), shelter: newShelter, files: null };
            SheltersToUpdate.push(shelUpdate);
        }
        stop = false;
        res.status(200).send(true);
    }
    else {
        updateShelter(req.params.id, req.body, shelUpdate && shelUpdate.isNew)
            .then(function () {
            res.status(200).send(true);
        })["catch"](function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    }
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
                                        updateFile(file._id, file)
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
        else if (req.body["new"] != undefined) {
            if (req.body["new"]) {
                stop = true;
                var id = new ObjectId();
                var newShelter = { _id: id };
                SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: null, isNew: true });
                stop = false;
                res.status(200).send({ id: id });
            }
            else {
                res.status(500).send({ error: "command not found" });
            }
        }
        else {
            res.status(500).send({ error: "command not found" });
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
    console.log("SessionID: " + req.sessionID + ", METHOD: " + req.method + ", QUERY: " + JSON.stringify(req.query) + ", PATH: " + req.path);
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Headers"] = "Content-Type";
        headers["content-type"] = 'application/json; charset=utf-8';
        res.writeHead(200, headers);
        res.end();
    }
    else {
        next();
    }
    /*
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('content-type', 'application/json; charset=utf-8');
*/
}, fileRoute, appRoute);
app.use(express.static(__dirname + '/dist'));
app.use(function (req, res, next) {
    console.log("SessionID: " + req.sessionID + ", METHOD: " + req.method + ", QUERY: " + JSON.stringify(req.query) + ", PATH: " + req.path);
    next();
});
app.use('/*', function (req, res) {
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers["Access-Control-Allow-Headers"] = "Content-Type";
        headers["content-type"] = 'text/html; charset=UTF-8';
        res.writeHead(200, headers);
        res.end();
    }
    else {
        res.sendFile(path.join(__dirname + '/dist/index.html'));
    }
    /*
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('content-type', 'text/html; charset=UTF-8');
    res.sendFile(path.join(__dirname + '/dist/index.html'));
    */
});
var server = app.listen(appPort, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//"mongodb://localhost:27017/ProvaDB",process.env.MONGODB_URI
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/CaiDB", {
    useMongoClient: true
}, function (err) {
    if (err) {
        console.log("Error connection: " + err);
        server.close(function () {
            console.log("Server Closed");
            process.exit(-1);
            return;
        });
    }
});
