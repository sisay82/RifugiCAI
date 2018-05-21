import * as express from 'express';
import { Enums } from '../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import Files_Enum = Enums.Files;
import multer = require('multer');
import {
    IFileExtended,
    ObjectId,
    UpdatingShelter,
    logger,
    LOG_TYPE,
    removeShelterToUpdate,
    getShelterToUpdateById,
    addShelterToUpdate
} from '../tools/common';
import { model } from 'mongoose';
import { IFile } from '../../src/app/shared/types/interfaces';
import { BCSchema } from '../../src/app/shared/types/schema';
import { DISABLE_AUTH } from './auth.api';
import { Buffer } from 'buffer';

const Files = model<IFileExtended>('Files', BCSchema.fileSchema);
const maxImages = 10;

export function countContributionFilesByShelter(shelid): Promise<Number> {
    return new Promise<Number>((resolve, reject) => {
        Files.count({ 'shelterId': shelid, type: Files_Enum.File_Type.contribution }).exec((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    });
}

export function insertNewFile(file: IFileExtended): Promise<IFileExtended> {
    return new Promise<IFileExtended>((resolve, reject) => {
        file.data = Buffer.from(file.data);
        Files.create(file, (err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        })
    });
}

function isValidFile(file): boolean {
    if (file.type === Enums.Files.File_Type.invoice) {
        if (file.value &&
            file.invoice_year &&
            file.invoice_tax &&
            file.invoice_type &&
            (
                Enums.Invoice_Type[file.invoice_type] !== <any>Enums.Invoice_Type.att ||
                file.contribution_type
            )
        ) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

function resolveFile(file): Promise<any> {
    if (isValidFile(file)) {
        if (file.remove) {
            return deleteFile(file._id);
        } else {
            if (!file.new && file.update) {
                return updateFile(file._id, file);
            } else {
                return insertNewFile(file);
            }
        }
    } else {
        return Promise.resolve();
    }
}

export function resolveFilesForShelter(shelter): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        if (shelter.files != null) {
            const promises = [];
            shelter.files.forEach(file => {
                promises.push(resolveFile(file));
            });

            Promise.all(promises)
                .then(() => {
                    removeShelterToUpdate(shelter);
                    resolve();
                })
                .catch(err => {
                    logger(LOG_TYPE.WARNING, err);
                    reject(err);
                });
        } else {
            removeShelterToUpdate(shelter);
            resolve();
        }
    })
}

function queryAllFiles(): Promise<IFileExtended[]> {
    return new Promise<IFileExtended[]>((resolve, reject) => {
        Files.find({},
            'name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type')
            .exec((err, ris) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ris);
                }
            })
    });
}

function queryFileByid(id): Promise<IFileExtended> {
    return new Promise<IFileExtended>((resolve, reject) => {
        Files.findById(id).exec((err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        })
    });
}

function queryFilesByshelterId(id, types?: Enums.Files.File_Type[]): Promise<IFileExtended[]> {
    return new Promise<IFileExtended[]>((resolve, reject) => {
        Files.find({
            'shelterId': id,
            type: { $in: types }
        },
            'name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type')
            .exec((err, ris) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ris);
                }
            })
    });
}

function updateFile(id: any, file): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const query = {
            $set: {
                contribution_type: file.contribution_type || null,
                invoice_year: file.invoice_year || null,
                invoice_tax: file.invoice_tax || null,
                invoice_type: file.invoice_type || null,
                invoice_confirmed: file.invoice_confirmed || null,
                value: file.value || null,
                description: file.description || null
            }
        }

        Files.findByIdAndUpdate(id, query).exec((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

function deleteFile(id): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (id) {
            Files.remove({ _id: id }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        } else {
            reject(new Error('Invalid id'));
        }
    });
}

function queryAllFilesByType(types): Promise<IFileExtended[]> {
    return new Promise<IFileExtended[]>((resolve, reject) => {
        Files.find({ type: { $in: types } }, 'name size contentType type description').exec((err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
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
                if (req.method === 'DELETE' || req.method === 'POST' || req.method === 'PUT') {
                    if (Auth_Permissions.Revision.DocRevisionPermission.find(obj => obj === user.role)) {
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
export const fileRoute = express.Router();
fileRoute.all('*', checkPermissionAPI);

fileRoute.route('/shelters/file')
    .post(function (req, res) {
        const upload = multer().single('file')
        upload(req, res, function (err) {
            if (err) {
                res.status(500).send({ error: 'Invalid user or request' })
            } else {
                const file = JSON.parse(req.file.buffer.toString());
                if (file.size < 1024 * 1024 * 16) {
                    insertNewFile(file)
                        .then((newFile) => {
                            res.status(200).send({
                                _id: newFile._id,
                                name: newFile.name
                                , size: newFile.size,
                                type: newFile.type,
                                contentType: newFile.contentType
                            });
                        })
                        .catch((e) => {
                            logger(LOG_TYPE.WARNING, e);
                            res.status(500).send({ error: 'Invalid user or request' });
                        })
                }
            }
        });
    });

fileRoute.route('/shelters/file/byType')
    .get(function (req, res) {
        queryAllFilesByType(req.query.types)
            .then((file) => {
                res.status(200).send(file);
            })
            .catch((err) => {
                logger(LOG_TYPE.WARNING, err);
                res.status(500).send({ error: 'Invalid user or request' });
            })
    });

fileRoute.route('/shelters/file/all')
    .get(function (req, res) {
        queryAllFiles()
            .then((file) => {
                res.status(200).send(file);
            })
            .catch((err) => {
                logger(LOG_TYPE.WARNING, err);
                res.status(500).send({ error: 'Invalid user or request' });
            })
    });

fileRoute.route('/shelters/file/confirm')
    .post(function (req, res) {
        try {
            const upload = multer().single('file');
            const user = req.body.user;
            upload(req, res, function (err) {
                if (err) {
                    res.status(500).send({ error: 'Invalid user or request' })
                } else {
                    const file = JSON.parse(req.file.buffer.toString());
                    if (file.size < 1024 * 1024 * 16) {
                        const id = file.shelterId;
                        const fileid = new ObjectId();
                        const shelUpdate = getShelterToUpdateById(id);
                        file._id = fileid;
                        file.new = true;
                        if (file.type === Files_Enum.File_Type.image) {
                            const shelFiles = queryFilesByshelterId(id)
                                .then(files => {
                                    const images = files.filter(obj => obj.type === Files_Enum.File_Type.image);
                                    if (shelUpdate) {
                                        if (images.length < maxImages &&
                                            (!shelUpdate.files || images.length + shelUpdate.files.length < maxImages)
                                        ) {
                                            if (shelUpdate.files) {
                                                shelUpdate.files.push(file);
                                            } else {
                                                shelUpdate.files = [file];
                                            }
                                            shelUpdate.watchDog = new Date(Date.now());
                                            res.status(200).send(fileid);
                                        } else {
                                            logger(LOG_TYPE.ERROR, 'Max ' + maxImages + ' images');
                                            res.status(500).send({ error: 'Invalid user or request' });
                                        }
                                    } else {
                                        if (images.length < maxImages) {
                                            const newShelter: UpdatingShelter = {
                                                shelter: <any>{ _id: id },
                                                watchDog: new Date(Date.now()),
                                                files: [file]
                                            };
                                            addShelterToUpdate(newShelter, user);
                                            res.status(200).send(fileid);
                                        } else {
                                            logger(LOG_TYPE.ERROR, 'Max ' + maxImages + ' images');
                                            res.status(500).send({ error: 'Invalid user or request' });
                                        }
                                    }
                                })
                                .catch(e => {
                                    if (shelUpdate) {
                                        if (!shelUpdate.files || shelUpdate.files.length < maxImages) {
                                            if (shelUpdate.files) {
                                                shelUpdate.files.push(file);
                                            } else {
                                                shelUpdate.files = [file];
                                            }
                                            shelUpdate.watchDog = new Date(Date.now());
                                            res.status(200).send(fileid);
                                        } else {
                                            logger(LOG_TYPE.ERROR, 'Max ' + maxImages + ' images');
                                            res.status(500).send({ error: 'Invalid user or request' });
                                        }
                                    } else {
                                        const newShelter: any = { _id: id };
                                        addShelterToUpdate({
                                            watchDog: new Date(Date.now()),
                                            shelter: newShelter,
                                            files: [file]
                                        }, user);
                                        res.status(200).send(fileid);
                                    }
                                });
                        } else {
                            if (shelUpdate) {
                                if (shelUpdate.files) {
                                    shelUpdate.files.push(file);
                                } else {
                                    shelUpdate.files = [file];
                                }
                                shelUpdate.watchDog = new Date(Date.now());
                            } else {
                                const newShelter: any = { _id: id };
                                addShelterToUpdate({
                                    watchDog: new Date(Date.now()),
                                    shelter: newShelter,
                                    files: [file]
                                }, user);
                            }
                            res.status(200).send(fileid);
                        }
                    } else {
                        logger(LOG_TYPE.ERROR, 'File size over limit');
                        res.status(500).send({ error: 'Invalid user or request' });
                    }
                }
            });
        } catch (e) {
            logger(LOG_TYPE.ERROR, e);
            res.status(500).send({ error: 'Invalid user or request' });
        }
    });

fileRoute.route('/shelters/file/confirm/:fileid/:shelid')
    .delete(function (req, res) {
        const shelUpdate = getShelterToUpdateById(req.params.shelid);
        const user = req.body.user;
        if (shelUpdate) {
            let fileToDelete;
            if (shelUpdate.files) {
                fileToDelete = shelUpdate.files.filter(f => String(f._id) === req.params.fileid);
            } else {
                shelUpdate.files = [];
            }
            if (fileToDelete && fileToDelete.length > 0) {
                shelUpdate.files.splice(shelUpdate.files.indexOf(fileToDelete[0]), 1);
                delete (fileToDelete[0].data);
                fileToDelete[0].remove = true;
            } else {
                shelUpdate.files.push({ _id: req.params.fileid, remove: true });
            }
            res.status(200).send(true);
        } else {
            const newShelter: any = {};
            newShelter._id = req.params.shelid;
            addShelterToUpdate({
                watchDog: new Date(Date.now()),
                shelter: newShelter, files: [{ _id: req.params.fileid, remove: true }]
            }, user);
            res.status(200).send(true);
        }
    })

fileRoute.route('/shelters/file/:id')
    .get(function (req, res) {
        queryFileByid(req.params.id)
            .then((file) => {
                res.status(200).send(file);
            })
            .catch((err) => {
                logger(LOG_TYPE.WARNING, err);
                res.status(500).send({ error: 'Invalid user or request' });
            })
    })
    .put(function (req, res) {
        try {
            const updFile: IFile = req.body.file;
            const user = req.body.user;
            if (updFile) {
                const shel = getShelterToUpdateById(updFile.shelterId);
                if (shel) {
                    let file;
                    if (shel.files) {
                        file = shel.files.filter(f => String(f._id) === req.params.id)[0];
                    } else {
                        shel.files = [];
                    }
                    if (file) {
                        for (const prop in updFile) {
                            if (updFile.hasOwnProperty(prop)) {
                                file[prop] = updFile[prop];
                            }
                        }
                        file.update = true;
                    } else {
                        const newF: any = {};
                        for (const prop in updFile) {
                            if (updFile.hasOwnProperty(prop)) {
                                newF[prop] = updFile[prop];
                            }
                        }
                        newF.update = true;
                        shel.files.push(newF);
                    }
                } else {
                    const shelter: any = { _id: updFile.shelterId };
                    const newF: any = {};
                    for (const prop in updFile) {
                        if (updFile.hasOwnProperty(prop)) {
                            newF[prop] = updFile[prop];
                        }
                    }
                    newF.update = true;
                    addShelterToUpdate({
                        watchDog: new Date(Date.now()),
                        shelter: shelter,
                        files: [newF]
                    }, user);
                }
                res.status(200).send(true);
            } else {
                res.status(500).send({ error: 'Invalid user or request' });
            }
        } catch (e) {
            logger(LOG_TYPE.ERROR, e);
            res.status(500).send({ error: 'Invalid user or request' });
        }
    })
    .delete(function (req, res) {
        deleteFile(req.params.id)
            .then(() => {
                res.status(200).send(true);
            })
            .catch(err => {
                logger(LOG_TYPE.WARNING, err);
                res.status(500).send({ error: 'Invalid user or request' });
            });
    });

fileRoute.route('/shelters/file/byshel/:id')
    .get(function (req, res) {
        const shel = getShelterToUpdateById(req.params.id);
        if (shel && shel.files != null) {
            queryFilesByshelterId(req.params.id)
                .then((files) => {
                    for (const f of shel.files.filter(obj => obj.type !== Files_Enum.File_Type.image)) {
                        if (f.remove) {
                            const fi = files.filter(obj => String(obj._id) === f._id)[0];
                            files.splice(files.indexOf(fi), 1);
                        } else if (f.new) {
                            files.push(f);
                        } else {
                            const fi = files.filter(obj => String(obj._id) === f._id)[0];
                            files[files.indexOf(fi)] = f;
                        }
                    }
                    res.status(200).send(files);
                })
                .catch((err) => {
                    res.status(500).send({ error: 'Invalid user or request' });
                });
        } else {
            queryFilesByshelterId(req.params.id)
                .then((file) => {
                    res.status(200).send(file);
                })
                .catch((err) => {
                    res.status(500).send({ error: 'Invalid user or request' });
                });
        }
    });

fileRoute.route('/shelters/file/byshel/:id/bytype')
    .get(function (req, res) {
        const shel = getShelterToUpdateById(req.params.id);
        const types = req.query.types.map(t => Number(t));
        if (shel && shel.files != null) {
            queryFilesByshelterId(req.params.id, types)
                .then((files) => {
                    const shelFiles = shel.files.filter(file => types.indexOf(file.type));
                    for (const f of shelFiles) {
                        if (f.remove) {
                            const fi = files.filter(obj => String(obj._id) === f._id)[0];
                            files.splice(files.indexOf(fi), 1);
                        } else if (f.new) {
                            files.push(f);
                        } else {
                            const fi = files.filter(obj => String(obj._id) === f._id)[0];
                            files[files.indexOf(fi)] = f;
                        }
                    }

                    res.status(200).send(files);
                })
                .catch((err) => {
                    res.status(500).send({ error: 'Invalid user or request' });
                });
        } else {
            queryFilesByshelterId(req.params.id, types)
                .then((file) => {
                    res.status(200).send(file);
                })
                .catch((err) => {
                    res.status(500).send({ error: 'Invalid user or request' });
                });
        }
    });
