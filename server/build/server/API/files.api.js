"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var enums_1 = require("../../src/app/shared/types/enums");
var Auth_Permissions = enums_1.Enums.Auth_Permissions;
var Files_Enum = enums_1.Enums.Files;
var multer = require("multer");
var common_1 = require("../common");
var mongoose = require("mongoose");
var schema_1 = require("../../src/app/shared/types/schema");
var Files = mongoose.model('Files', schema_1.Schema.fileSchema);
var maxImages = 10;
function countContributionFilesByShelter(shelid) {
    return new Promise(function (resolve, reject) {
        Files.count({ 'shelterId': shelid, type: Files_Enum.File_Type.contribution }).exec(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}
exports.countContributionFilesByShelter = countContributionFilesByShelter;
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
exports.insertNewFile = insertNewFile;
function resolveFile(file) {
    if (file.remove) {
        return deleteFile(file._id);
    }
    else {
        if (!file.new && file.update) {
            return updateFile(file._id, file);
        }
        else {
            return insertNewFile(file);
        }
    }
}
function resolveFilesForShelter(shelter) {
    return new Promise(function (resolve, reject) {
        if (shelter.files != null) {
            var promises_1 = [];
            shelter.files.forEach(function (file) {
                promises_1.push(resolveFile(file));
            });
            Promise.all(promises_1)
                .then(function () {
                common_1.SheltersToUpdate.splice(common_1.SheltersToUpdate.indexOf(shelter), 1);
                resolve();
            })
                .catch(function (err) {
                common_1.logger(err);
                reject(err);
            });
        }
        else {
            common_1.SheltersToUpdate.splice(common_1.SheltersToUpdate.indexOf(shelter), 1);
            resolve();
        }
    });
}
exports.resolveFilesForShelter = resolveFilesForShelter;
function queryAllFiles() {
    return new Promise(function (resolve, reject) {
        Files.find({ type: { $not: { $in: [Files_Enum.File_Type.image] }
            }
        }, 'name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type')
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
function queryFileByid(id) {
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
function queryFilesByshelterId(id) {
    return new Promise(function (resolve, reject) {
        Files.find({
            'shelterId': id,
            type: { $not: { $in: [Files_Enum.File_Type.image] }
            }
        }, 'name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type')
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
function queryImagesByshelterId(id) {
    return new Promise(function (resolve, reject) {
        Files.find({ 'shelterId': id, type: Files_Enum.File_Type.image }, 'name size contentType type description').exec(function (err, ris) {
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
        Files.find({ type: Files_Enum.File_Type.image }, 'name size contentType type description').exec(function (err, ris) {
            if (err) {
                reject(err);
            }
            else {
                resolve(ris);
            }
        });
    });
}
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
            reject(new Error('Invalid id'));
        }
    });
}
function checkPermissionAPI(req, res, next) {
    var user = req.body.user;
    if (user) {
        if (req.method === 'GET') {
            next();
        }
        else {
            if (req.method === 'DELETE' || req.method === 'POST' || req.method === 'PUT') {
                if (Auth_Permissions.Revision.DocRevisionPermission.find(function (obj) { return obj === user.role; })) {
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
exports.fileRoute = express.Router();
exports.fileRoute.all('*', checkPermissionAPI);
exports.fileRoute.route('/shelters/file')
    .post(function (req, res) {
    var upload = multer().single('file');
    upload(req, res, function (err) {
        if (err) {
            res.status(500).send({ error: 'Error in file upload' });
        }
        else {
            var file = JSON.parse(req.file.buffer.toString());
            if (file.size < 1024 * 1024 * 16) {
                insertNewFile(file)
                    .then(function (newFile) {
                    res.status(200).send({
                        _id: newFile._id,
                        name: newFile.name,
                        size: newFile.size,
                        type: newFile.type,
                        contentType: newFile.contentType
                    });
                })
                    .catch(function (e) {
                    common_1.logger(e);
                    res.status(500).send(e);
                });
            }
        }
    });
});
exports.fileRoute.route('/shelters/file/all')
    .get(function (req, res) {
    queryAllFiles()
        .then(function (file) {
        res.status(200).send(file);
    })
        .catch(function (err) {
        common_1.logger(err);
        res.status(500).send(err);
    });
});
exports.fileRoute.route('/shelters/image/all')
    .get(function (req, res) {
    queryAllImages()
        .then(function (file) {
        res.status(200).send(file);
    })
        .catch(function (err) {
        common_1.logger(err);
        res.status(500).send(err);
    });
});
exports.fileRoute.route('/shelters/file/confirm')
    .post(function (req, res) {
    try {
        var upload = multer().single('file');
        upload(req, res, function (err) {
            if (err) {
                res.status(500).send({ error: 'Error in file upload' });
            }
            else {
                var file_1 = JSON.parse(req.file.buffer.toString());
                if (file_1.size < 1024 * 1024 * 16) {
                    var id_1 = file_1.shelterId;
                    var fileid_1 = new common_1.ObjectId();
                    var shelUpdate_1 = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === id_1; });
                    file_1._id = fileid_1;
                    file_1.new = true;
                    if (file_1.type === Files_Enum.File_Type.image) {
                        var shelFiles = queryFilesByshelterId(id_1)
                            .then(function (files) {
                            var images = files.filter(function (obj) { return obj.type === Files_Enum.File_Type.image; });
                            if (shelUpdate_1 && shelUpdate_1.length > 0) {
                                if (images.length < maxImages &&
                                    (!shelUpdate_1[0].files || images.length + shelUpdate_1[0].files.length < maxImages)) {
                                    if (shelUpdate_1[0].files) {
                                        shelUpdate_1[0].files.push(file_1);
                                    }
                                    else {
                                        shelUpdate_1[0].files = [file_1];
                                    }
                                    shelUpdate_1[0].watchDog = new Date(Date.now());
                                    res.status(200).send(fileid_1);
                                }
                                else {
                                    res.status(500).send({ error: 'Max ' + maxImages + ' images' });
                                }
                            }
                            else {
                                if (images.length < maxImages) {
                                    var newShelter = {
                                        shelter: { _id: id_1 },
                                        watchDog: new Date(Date.now()),
                                        files: [file_1]
                                    };
                                    common_1.SheltersToUpdate.push(newShelter);
                                    res.status(200).send(fileid_1);
                                }
                                else {
                                    res.status(500).send({ error: 'Max ' + maxImages + ' images' });
                                }
                            }
                        })
                            .catch(function (e) {
                            if (shelUpdate_1 && shelUpdate_1.length > 0) {
                                if (!shelUpdate_1[0].files || shelUpdate_1[0].files.length < maxImages) {
                                    if (shelUpdate_1[0].files) {
                                        shelUpdate_1[0].files.push(file_1);
                                    }
                                    else {
                                        shelUpdate_1[0].files = [file_1];
                                    }
                                    shelUpdate_1[0].watchDog = new Date(Date.now());
                                    res.status(200).send(fileid_1);
                                }
                                else {
                                    res.status(500).send({ error: 'Max ' + maxImages + ' images' });
                                }
                            }
                            else {
                                var newShelter = { _id: id_1 };
                                common_1.SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [file_1] });
                                res.status(200).send(fileid_1);
                            }
                        });
                    }
                    else {
                        if (shelUpdate_1 && shelUpdate_1.length > 0) {
                            if (shelUpdate_1[0].files) {
                                shelUpdate_1[0].files.push(file_1);
                            }
                            else {
                                shelUpdate_1[0].files = [file_1];
                            }
                            shelUpdate_1[0].watchDog = new Date(Date.now());
                        }
                        else {
                            var newShelter = { _id: id_1 };
                            common_1.SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [file_1] });
                        }
                        res.status(200).send(fileid_1);
                    }
                }
                else {
                    res.status(500).send({ error: 'File size over limit' });
                }
            }
        });
    }
    catch (e) {
        common_1.logger(e);
        res.status(500).send({ error: 'Error undefined' });
    }
});
exports.fileRoute.route('/shelters/file/confirm/:fileid/:shelid')
    .delete(function (req, res) {
    var shelUpdate = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === req.params.shelid; });
    if (shelUpdate && shelUpdate.length > 0) {
        var fileToDelete = void 0;
        if (shelUpdate[0].files) {
            fileToDelete = shelUpdate[0].files.filter(function (f) { return String(f._id) === req.params.fileid; });
        }
        else {
            shelUpdate[0].files = [];
        }
        if (fileToDelete && fileToDelete.length > 0) {
            shelUpdate[0].files.splice(shelUpdate[0].files.indexOf(fileToDelete[0]), 1);
            delete (fileToDelete[0].data);
            fileToDelete[0].remove = true;
        }
        else {
            shelUpdate[0].files.push({ _id: req.params.fileid, remove: true });
        }
        res.status(200).send(true);
    }
    else {
        var newShelter = {};
        newShelter._id = req.params.shelid;
        common_1.SheltersToUpdate.push({ watchDog: new Date(Date.now()), shelter: newShelter, files: [{ _id: req.params.fileid, remove: true }] });
        res.status(200).send(true);
    }
});
exports.fileRoute.route('/shelters/file/:id')
    .get(function (req, res) {
    queryFileByid(req.params.id)
        .then(function (file) {
        res.status(200).send(file);
    })
        .catch(function (err) {
        common_1.logger(err);
        res.status(500).send(err);
    });
})
    .put(function (req, res) {
    try {
        var updFile_1 = req.body.file;
        if (updFile_1) {
            var shel = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id && obj.shelter._id === updFile_1.shelterId; })[0];
            if (shel) {
                var file = void 0;
                if (shel.files) {
                    file = shel.files.filter(function (f) { return String(f._id) === req.params.id; })[0];
                }
                else {
                    shel.files = [];
                }
                if (file) {
                    for (var prop in updFile_1) {
                        if (updFile_1.hasOwnProperty(prop)) {
                            file[prop] = updFile_1[prop];
                        }
                    }
                    file.update = true;
                }
                else {
                    var newF = {};
                    for (var prop in updFile_1) {
                        if (updFile_1.hasOwnProperty(prop)) {
                            newF[prop] = updFile_1[prop];
                        }
                    }
                    newF.update = true;
                    shel.files.push(newF);
                }
            }
            else {
                var shelter = { _id: updFile_1.shelterId };
                var newF = {};
                for (var prop in updFile_1) {
                    if (updFile_1.hasOwnProperty(prop)) {
                        newF[prop] = updFile_1[prop];
                    }
                }
                newF.update = true;
                common_1.SheltersToUpdate.push({
                    watchDog: new Date(Date.now()),
                    shelter: shelter,
                    files: [newF]
                });
            }
            res.status(200).send(true);
        }
        else {
            res.status(500).send({ error: 'Incorrect request' });
        }
    }
    catch (e) {
        common_1.logger(e);
        res.status(500).send({ error: e });
    }
})
    .delete(function (req, res) {
    deleteFile(req.params.id)
        .then(function () {
        res.status(200).send(true);
    })
        .catch(function (err) {
        common_1.logger(err);
        res.status(500).send(err);
    });
});
exports.fileRoute.route('/shelters/file/byshel/:id')
    .get(function (req, res) {
    var shel = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === req.params.id; })[0];
    if (!shel) {
        queryFilesByshelterId(req.params.id)
            .then(function (file) {
            res.status(200).send(file);
        })
            .catch(function (err) {
            res.status(500).send(err);
        });
    }
    else {
        queryFilesByshelterId(req.params.id)
            .then(function (files) {
            if (shel.files != null) {
                var _loop_1 = function (f) {
                    if (f.remove) {
                        var fi = files.filter(function (obj) { return obj._id === f._id; })[0];
                        files.splice(files.indexOf(fi), 1);
                    }
                    else if (f.new) {
                        files.push(f);
                    }
                    else {
                        var fi = files.filter(function (obj) { return obj._id === f._id; })[0];
                        files[files.indexOf(fi)] = f;
                    }
                };
                for (var _i = 0, _a = shel.files.filter(function (obj) { return obj.type !== Files_Enum.File_Type.image; }); _i < _a.length; _i++) {
                    var f = _a[_i];
                    _loop_1(f);
                }
                res.status(200).send(files);
            }
            else {
                res.status(200).send(files);
            }
        })
            .catch(function (err) {
            res.status(500).send(err);
        });
    }
});
exports.fileRoute.route('/shelters/image/byshel/:id')
    .get(function (req, res) {
    var shel = common_1.SheltersToUpdate.filter(function (obj) { return obj.shelter._id === req.params.id; })[0];
    if (!shel) {
        queryImagesByshelterId(req.params.id)
            .then(function (file) {
            res.status(200).send(file);
        })
            .catch(function (err) {
            res.status(500).send(err);
        });
    }
    else {
        queryImagesByshelterId(req.params.id)
            .then(function (file) {
            if (shel.files != null) {
                var _loop_2 = function (f) {
                    if (f.remove) {
                        var fi = file.filter(function (obj) { return obj._id === f._id; })[0];
                        file.splice(file.indexOf(fi), 1);
                    }
                    else if (f.new) {
                        file.push(f);
                    }
                    else {
                        var fi = file.filter(function (obj) { return obj._id === f._id; })[0];
                        file[file.indexOf(fi)] = f;
                    }
                };
                for (var _i = 0, _a = shel.files.filter(function (obj) { return obj.type === Files_Enum.File_Type.image; }); _i < _a.length; _i++) {
                    var f = _a[_i];
                    _loop_2(f);
                }
                res.status(200).send(file);
            }
            else {
                res.status(200).send(file);
            }
        })
            .catch(function (err) {
            res.status(500).send(err);
        });
    }
});
//# sourceMappingURL=files.api.js.map