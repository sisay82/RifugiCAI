import * as express from 'express';
import { Enums } from '../../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import {
    addShelterToUpdate,
    IShelterExtended,
    removeShelterToUpdate,
    getShelterToUpdateById,
    downloadCSV
} from '../../tools/common';
import {
    UserData,
    getUserDataFilters,
    logger,
    LOG_TYPE,
    ObjectId,
    UpdatingShelter
} from '../../tools/common';
import { resolveFilesForShelter } from '../files/files.logic';
import { Tools } from '../../../src/app/shared/tools/common.tools';
import { Buffer } from 'buffer';
import {
    checkPermissionAPI,
    getAllIdsHead,
    insertNewShelter,
    queryShelByRegion,
    queryShelAroundPoint,
    queryShelById,
    updateShelter,
    confirmShelter,
    deleteShelter,
    queryShelPage,
    queryAllSheCSV,
    queryShelSectionById,
    deleteService
} from './shelters.logic';


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

appRoute.route('/shelters/csv/list')
    .get(function (req, res) {
        if (req.body.user && req.body.user.role && Auth_Permissions.Visualization.CSVPermission.indexOf(req.body.user.role) > -1) {
            queryAllSheCSV()
                .then(shelters => downloadCSV(shelters, res))
                .then(csv => {
                    const buff = Buffer.from(csv);
                    res.status(200).send({ buff: buff });
                })
                .catch(err => {
                    logger(LOG_TYPE.ERROR, err);
                    res.status(500).send({ error: "Invalid user or request" });
                })
        } else {
            logger(LOG_TYPE.INFO, "User not authorized")
            res.status(500).send({ error: "Invalid user or request" });
        }
    });

appRoute.route('/shelters/csv/:id')
    .get(function (req, res) {
        if (req.body.user && req.body.user.role && Auth_Permissions.Visualization.CSVPermission.indexOf(req.body.user.role) > -1) {
            queryShelById(req.params.id)
                .then(shelters => downloadCSV([shelters], res))
                .then(csv => {
                    const buff = Buffer.from(csv);
                    res.status(200).send({ buff: buff });
                })
                .catch(err => {
                    logger(LOG_TYPE.ERROR, err);
                    res.status(500).send({ error: "Invalid user or request" });
                })
        } else {
            logger(LOG_TYPE.INFO, "User not authorized")
            res.status(500).send({ error: "Invalid user or request" });
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
