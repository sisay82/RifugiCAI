import * as express from 'express';
import { Enums } from '../../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import {
    IShelterExtended, sendFatalError
} from '../../tools/common';
import { createCSV } from './csv.logic';
import {
    getUserDataFilters,
    logger,
    LOG_TYPE,
    ObjectId
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
import { UserData } from '../auth/userData';
import { StagingInterfaces, StagingAreaTools } from '../../tools/stagingArea';


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
        StagingAreaTools.getStaginItemByShelId(req.params.id)
            .then(stagingItem => {
                if (req.query.confirm) {
                    for (const prop in req.body) {
                        if (req.body.hasOwnProperty(prop)) {
                            stagingItem.shelter[prop] = req.body[prop];
                        }
                    }
                    stagingItem.watchDog = new Date(Date.now());
                    stagingItem.save();
                    res.status(200).send(true);
                } else {
                    updateShelter(req.params.id, req.body, stagingItem && stagingItem.newItem)
                        .then(() => {
                            res.status(200).send(true);
                        })
                        .catch((err) => {
                            logger(LOG_TYPE.WARNING, err);
                            res.status(500).send({ error: 'Invalid user or request' });
                        });
                }
            })
            .catch(err => {
                if (!err) {
                    const newShelter: IShelterExtended = req.body;
                    newShelter._id = req.params.id;
                    const stagingItem = { watchDog: new Date(Date.now()), shelter: newShelter, files: null }
                    StagingAreaTools.addItemAndSend(
                        stagingItem,
                        req.body.user,
                        (item) => res.status(200).send(true),
                        e => sendFatalError(res, e)
                    );
                } else {
                    sendFatalError(res, err);
                }
            })

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
                StagingAreaTools.getStaginItemByShelId(req.params.id)
                    .then(stagingItem => {
                        if (req.body.confirm) {
                            confirmShelter(req.params.id)
                                .then((ris) => resolveFilesForShelter(stagingItem))
                                .then((ris) => {
                                    res.status(200).send(true);
                                })
                                .catch((err) => {
                                    res.status(500).send({ error: 'Invalid user or request' });
                                });
                        } else {
                            StagingAreaTools.removeShelterToUpdate(stagingItem)
                            .then(() => res.status(200).send(true))
                            .catch(err => sendFatalError(res, err));
                        }
                    })
                    .catch(err => {
                        if (!err) {
                            res.status(200).send(true);
                        } else {
                            logger(LOG_TYPE.ERROR, err);
                        }
                    });

            } else if (req.body.new) {
                const id = new ObjectId();
                const newShelter: any = { _id: id };
                StagingAreaTools.addItemAndSend(
                    { watchDog: new Date(Date.now()), shelter: newShelter, files: null, newItem: true },
                    req.body.user,
                    (item) => res.status(200).send({ id: id }),
                    err => sendFatalError(res, err)
                );
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
            StagingAreaTools.getStaginItemByShelId(req.params.id)
                .then(stagingItem => {
                    stagingItem.shelter[req.params.section] = req.body[req.params.section];
                    stagingItem.watchDog = new Date(Date.now());
                    stagingItem.save();
                    res.status(200).send(true);
                })
                .catch(err => {
                    if (!err) {
                        const newShelter: IShelterExtended = req.body;
                        newShelter._id = req.params.id;

                        StagingAreaTools.addItemAndSend(
                            { watchDog: new Date(Date.now()), shelter: newShelter, files: null },
                            req.body.user,
                            (item) => res.status(200).send(true),
                            e => sendFatalError(res, e)
                        );
                    } else {
                        logger(LOG_TYPE.ERROR, err);
                    }
                });
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
                .then(shelters => createCSV(shelters))
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
                .then(shelters => createCSV([shelters]))
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
            StagingAreaTools.getStaginItemByShelId(req.params.id)
                .then(stagingItem => {
                    stagingItem.watchDog = new Date(Date.now());
                    stagingItem.save();
                    res.status(200).send(stagingItem.shelter);
                })
                .catch(err => {
                    if (!err) {
                        queryShelSectionById(req.params.id, req.params.name)
                            .then((ris) => {
                                if (ris != null) {
                                    res.status(200).send(ris);
                                } else {
                                    res.status(200).send({ _id: req.params.id });
                                }
                            })
                            .catch((e) => {
                                logger(LOG_TYPE.INFO, e);
                                res.status(500).send({ error: 'Invalid user or request' });
                            });
                    } else {
                        logger(LOG_TYPE.ERROR, err);
                    }
                });
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
