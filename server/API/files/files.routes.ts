import * as express from 'express';
import { Enums } from '../../../src/app/shared/types/enums';
import Files_Enum = Enums.Files;
import multer = require('multer');
import {
    IFileExtended,
    ObjectId,
    UpdatingShelter,
    logger,
    LOG_TYPE,
    getShelterToUpdateById,
    addShelterToUpdate,
    sendFile
} from '../../tools/common';
import { IFile } from '../../../src/app/shared/types/interfaces';
import { checkPermissionAPI,
    insertNewFile,
    MAX_IMAGES,
    queryAllFilesByType,
    queryAllFiles,
    queryFilesByshelterId,
    queryFileByid,
    deleteFile
} from './files.logic';

export const fileRoute = express.Router();

fileRoute.all('*', checkPermissionAPI);

fileRoute.route('/shelters/file')
    .post(function (req, res) {
        const upload = multer().single('file')
        upload(req, res, function (err) {
            if (err) {
                res.status(500).send({ error: 'Invalid user or request' })
            } else {
                const file = <IFileExtended>JSON.parse(req.body.metadata);
                file.data = req.file.buffer;
                if (file.size < 1024 * 1024 * 16) {
                    insertNewFile(file)
                        .then((newFile) => {
                            res.status(200).send(newFile);
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
                    const file = <IFileExtended>JSON.parse(req.body.metadata);
                    file.data = req.file.buffer;
                    if (file.size < 1024 * 1024 * 16) {
                        const id = file.shelterId;
                        const fileid = new ObjectId();
                        const shelUpdate = getShelterToUpdateById(id);
                        (<any>file)._id = fileid;
                        (<any>file).new = true;
                        if (file.type === Files_Enum.File_Type.image) {
                            const shelFiles = queryFilesByshelterId(id)
                                .then(files => {
                                    const images = files.filter(obj => obj.type === Files_Enum.File_Type.image);
                                    if (shelUpdate) {
                                        if (images.length < MAX_IMAGES &&
                                            (!shelUpdate.files || images.length + shelUpdate.files.length < MAX_IMAGES)
                                        ) {
                                            if (shelUpdate.files) {
                                                shelUpdate.files.push(file);
                                            } else {
                                                shelUpdate.files = [file];
                                            }
                                            shelUpdate.watchDog = new Date(Date.now());
                                            res.status(200).send(fileid);
                                        } else {
                                            logger(LOG_TYPE.ERROR, 'Max ' + MAX_IMAGES + ' images');
                                            res.status(500).send({ error: 'Invalid user or request' });
                                        }
                                    } else {
                                        if (images.length < MAX_IMAGES) {
                                            const newShelter: UpdatingShelter = {
                                                shelter: <any>{ _id: id },
                                                watchDog: new Date(Date.now()),
                                                files: [file]
                                            };
                                            addShelterToUpdate(newShelter, user);
                                            res.status(200).send(fileid);
                                        } else {
                                            logger(LOG_TYPE.ERROR, 'Max ' + MAX_IMAGES + ' images');
                                            res.status(500).send({ error: 'Invalid user or request' });
                                        }
                                    }
                                })
                                .catch(e => {
                                    if (shelUpdate) {
                                        if (!shelUpdate.files || shelUpdate.files.length < MAX_IMAGES) {
                                            if (shelUpdate.files) {
                                                shelUpdate.files.push(file);
                                            } else {
                                                shelUpdate.files = [file];
                                            }
                                            shelUpdate.watchDog = new Date(Date.now());
                                            res.status(200).send(fileid);
                                        } else {
                                            logger(LOG_TYPE.ERROR, 'Max ' + MAX_IMAGES + ' images');
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
        try {
            const queryCursor = queryFileByid(req.params.id);
            sendFile(res, queryCursor)
                .then(() => {
                    res.end();
                })
                .catch(err => {
                    logger(LOG_TYPE.ERROR, err);
                    res.status(500).send({ error: 'Invalid user or request' });
                });
        } catch (e) {
            logger(LOG_TYPE.ERROR, e);
            res.status(500).send({ error: 'Invalid user or request' });
        }
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
        const types = req.query.types.map(t => Enums.Files.File_Type[t] || Number(t) || null);
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
