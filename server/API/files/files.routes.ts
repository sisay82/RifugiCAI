import * as express from 'express';
import { Enums } from '../../../src/app/shared/types/enums';
import Files_Enum = Enums.Files;
import multer = require('multer');
import {
    IFileExtended,
    logger,
    LOG_TYPE,
    sendFatalError
} from '../../tools/common';
import { IFile } from '../../../src/app/shared/types/interfaces';
import {
    insertNewFile,
    queryAllFilesByType,
    queryAllFiles,
    queryFilesByshelterId,
    queryFileByid,
    deleteFile,
    resolveStagingAreaFiles,
    intersectFilesArray,
    filterStagingFile,
    createPermissionFileAPICheck
} from './files.logic';
import { StagingAreaTools, StagingInterfaces } from '../../tools/stagingArea';
import { AuthService } from '../../config/init';

export const fileRoute = express.Router();

const OPEN_ROUTES: RegExp[] = [
    /^(\/shelters\/file\/[^\/]+)$/,
    /^(\/shelters\/file\/byshel\/[^\/]+\/bytype)$/
];

fileRoute.all('/shelters/file*', createPermissionFileAPICheck(AuthService, OPEN_ROUTES));

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
            upload(req, res, function (err) {
                if (err) {
                    res.status(500).send({ error: 'Invalid user or request' })
                } else {
                    const file = <StagingInterfaces.StagingFileExtended>JSON.parse(req.body.metadata);
                    file.data = req.file.buffer;
                    if (file.size < 1024 * 1024 * 16) {
                        resolveStagingAreaFiles(file, req.session)
                            .then(fileid => {
                                res.status(200).send({ fileId: fileid });
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
        StagingAreaTools.getStaginItemByShelId(req.params.shelid)
            .then(stagingItem => {
                let fileToDelete;
                if (stagingItem.files) {
                    fileToDelete = stagingItem.files.find(f => String(f._id) === req.params.fileid);
                } else {
                    stagingItem.files = [];
                }
                if (fileToDelete) {
                    // stagingItem.files.splice(stagingItem.files.indexOf(fileToDelete[0]), 1);
                    delete (fileToDelete.data);
                    fileToDelete.toRemove = true;
                } else {
                    stagingItem.files = stagingItem.files.concat(<any>{ _id: req.params.fileid, toRemove: true });
                }
                stagingItem.save((err, ris) => {
                    if (!err) {
                        res.status(200).send(true);
                    } else {
                        sendFatalError(res, err);
                    }
                })
            })
            .catch(err => {
                if (!err) {
                    const newShelter: any = {};
                    newShelter._id = req.params.shelid;
                    StagingAreaTools.addStagingItem({
                        watchDog: new Date(Date.now()),
                        shelter: newShelter,
                        files: [{ _id: req.params.fileid, toRemove: true }]
                    }, req.session)
                        .then(item => {
                            res.status(200).send(true);
                        })
                        .catch(e => { sendFatalError(res, e) });
                } else {
                    sendFatalError(res, err);
                }
            });
    });

fileRoute.route('/shelters/file/:id')
    .get(function (req, res) {
        try {
            queryFileByid(req.params.id)
                .then(data => {
                    res.send(data);
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
                            stagingItem.files = stagingItem.files.concat(newF);
                        }
                        stagingItem.save((err, ris) => {
                            if (!err) {
                                return Promise.resolve();
                            } else {
                                return Promise.reject(err);
                            }
                        });

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
                            }, req.session);
                        } else {
                            sendFatalError(res, err);
                        }
                    })
                    .then(val => { res.status(200).send(true) })
                    .catch(e => { sendFatalError(res, e) });
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
        const types = req.query.types.map(t => Number(t) !== NaN ? Number(t) : Enums.Files.File_Type[t] || null);
        StagingAreaTools.getStaginItemByShelId(req.params.id)
            .then(stagingItem => {
                if (stagingItem.files != null) {
                    queryFilesByshelterId(req.params.id, types)
                        .then((files) => {
                            const stagingFiles = stagingItem.files.filter(file => filterStagingFile(file, types));
                            const retFiles = intersectFilesArray(stagingFiles, files);
                            res.status(200).send(retFiles);
                        })
                        .catch((err) => {
                            sendFatalError(res, err);
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
