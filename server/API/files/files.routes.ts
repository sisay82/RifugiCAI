import * as express from 'express';
import { Enums } from '../../../src/app/shared/types/enums';
import Files_Enum = Enums.Files;
import multer = require('multer');
import {
    IFileExtended,
    ObjectId,
    logger,
    LOG_TYPE,
    sendFile,
    sendFatalError
} from '../../tools/common';
import { IFile } from '../../../src/app/shared/types/interfaces';
import {
    checkPermissionAPI,
    insertNewFile,
    MAX_IMAGES,
    queryAllFilesByType,
    queryAllFiles,
    queryFilesByshelterId,
    queryFileByid,
    deleteFile,
    resolveStagingAreaFiles,
    intersectFilesArray
} from './files.logic';
import { StagingAreaTools, StagingInterfaces } from '../../tools/stagingArea';

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
                    const file = <StagingInterfaces.StagingFile>JSON.parse(req.body.metadata);
                    file.data = req.file.buffer;
                    if (file.size < 1024 * 1024 * 16) {
                        resolveStagingAreaFiles(file, user)
                            .then(fileid => {
                                res.status(200).send(fileid);
                            })
                            .catch(e => {
                                sendFatalError(res, e);
                            });
                    } else {
                        logger(LOG_TYPE.ERROR, 'File size over limit');
                        res.status(500).send({ error: 'Invalid user or request' });
                    }
                }
            });
        } catch (e) {
            sendFatalError(res, e);
        }
    });

fileRoute.route('/shelters/file/confirm/:fileid/:shelid')
    .delete(function (req, res) {
        const user = req.body.user;
        StagingAreaTools.getStaginItemByShelId(req.params.shelid)
            .then(stagingItem => {
                let fileToDelete;
                if (stagingItem.files) {
                    fileToDelete = stagingItem.files.filter(f => String(f._id) === req.params.fileid);
                } else {
                    stagingItem.files = [];
                }
                if (fileToDelete && fileToDelete.length > 0) {
                    stagingItem.files.splice(stagingItem.files.indexOf(fileToDelete[0]), 1);
                    delete (fileToDelete[0].data);
                    fileToDelete[0].toRemove = true;
                } else {
                    stagingItem.files.push(<any>{ _id: req.params.fileid, toRemove: true });
                }
                res.status(200).send(true);
            })
            .catch(err => {
                if (!err) {
                    const newShelter: any = {};
                    newShelter._id = req.params.shelid;
                    StagingAreaTools.addStagingItem({
                        watchDog: new Date(Date.now()),
                        shelter: newShelter,
                        files: [{ _id: req.params.fileid, toRemove: true }]
                    }, user)
                        .then(item => res.status(200).send(true))
                        .catch(e => sendFatalError(res, e));
                } else {
                    sendFatalError(res, err);
                }
            });
    });

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
        } catch (err) {
            sendFatalError(res, err);
        }
    })
    .put(function (req, res) {
        try {
            const updFile: IFile = req.body.file;
            const user = req.body.user;
            if (updFile) {
                StagingAreaTools.getStaginItemByShelId(updFile.shelterId)
                    .then(stagingItem => {
                        let file;
                        if (stagingItem.files) {
                            file = stagingItem.files.filter(f => String(f._id) === req.params.id)[0];
                        } else {
                            stagingItem.files = [];
                        }
                        if (file) {
                            for (const prop in updFile) {
                                if (updFile.hasOwnProperty(prop)) {
                                    file[prop] = updFile[prop];
                                }
                            }
                            file.toUpdate = true;
                        } else {
                            const newF: any = {};
                            for (const prop in updFile) {
                                if (updFile.hasOwnProperty(prop)) {
                                    newF[prop] = updFile[prop];
                                }
                            }
                            newF.toUpdate = true;
                            stagingItem.files.push(newF);
                        }
                        stagingItem.save();
                        return Promise.resolve();
                    })
                    .catch(err => {
                        if (!err) {
                            const shelter = { _id: updFile.shelterId };
                            const newF: any = {};
                            for (const prop in updFile) {
                                if (updFile.hasOwnProperty(prop)) {
                                    newF[prop] = updFile[prop];
                                }
                            }
                            newF.toUpdate = true;
                            return StagingAreaTools.addStagingItem({
                                watchDog: new Date(Date.now()),
                                shelter: shelter,
                                files: [newF]
                            }, user);
                        } else {
                            sendFatalError(res, err);
                        }
                    })
                    .then(val => res.status(200).send(true))
                    .catch(e => sendFatalError(res, e));
            } else {
                res.status(500).send({ error: 'Invalid user or request' });
            }
        } catch (e) {
            sendFatalError(res, e);
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
        StagingAreaTools.getStaginItemByShelId(req.params.id)
            .then(stagingItem => {
                if (stagingItem.files != null) {
                    queryFilesByshelterId(req.params.id)
                        .then((files) => {
                            const stagingFiles = stagingItem.files.filter(obj => obj.type !== Files_Enum.File_Type.image)
                            const retFiles = intersectFilesArray(stagingFiles, files);
                            res.status(200).send(retFiles);
                        })
                        .catch((err) => {
                            res.status(500).send({ error: 'Invalid user or request' });
                        });
                } else {
                    return Promise.reject(null);
                }
            })
            .catch(err => {
                if (!err) {
                    queryFilesByshelterId(req.params.id)
                        .then((file) => {
                            res.status(200).send(file);
                        })
                        .catch((e) => {
                            res.status(500).send({ error: 'Invalid user or request' });
                        });
                } else {
                    sendFatalError(res, err);
                }
            });

    });

fileRoute.route('/shelters/file/byshel/:id/bytype')
    .get(function (req, res) {
        const types = req.query.types.map(t => Enums.Files.File_Type[t] || Number(t) || null);
        StagingAreaTools.getStaginItemByShelId(req.params.id)
            .then(stagingItem => {
                if (stagingItem.files != null) {
                    queryFilesByshelterId(req.params.id, types)
                        .then((files) => {
                            const stagingFiles = stagingItem.files.filter(file => types.indexOf(file.type));
                            const retFiles = intersectFilesArray(stagingFiles, files);
                            res.status(200).send(retFiles);
                        })
                        .catch((err) => {
                            res.status(500).send({ error: 'Invalid user or request' });
                        });
                } else {
                    return Promise.reject(null);
                }
            })
            .catch(err => {
                if (!err) {
                    queryFilesByshelterId(req.params.id, types)
                        .then((file) => {
                            res.status(200).send(file);
                        })
                        .catch((e) => {
                            sendFatalError(res, e);
                        });
                } else {
                    sendFatalError(res, err);
                }
            });
    });
