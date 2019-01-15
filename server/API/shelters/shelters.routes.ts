import * as express from "express";
import { Enums } from "../../../src/app/shared/types/enums";
import Auth_Permissions = Enums.Auth_Permissions;
import { IShelterExtended } from "../../tools/common";
import { createCSV } from "./csv.logic";
import {
    getUserDataFilters,
    logger,
    LOG_TYPE,
    ObjectId
} from "../../tools/common";
import { resolveFilesForShelter } from "../files/files.logic";
import { Tools } from "../../../src/app/shared/tools/common.tools";
import { Buffer } from "buffer";
import {
    createPermissionAppAPICheck,
    getAllIdsHead,
    insertNewShelter,
    getShelByRegion,
    getShelAroundPoint,
    getShelterById,
    updateShelter,
    confirmShelter,
    deleteShelter,
    getShelPage,
    queryAllShelters,
    getShelSectionById,
    deleteService,
    getShelterHeadById,
    getShelterHeaderByProperty
} from "./shelters.logic";
import { StagingAreaTools } from "../../tools/stagingArea";
import { AuthService } from "../../config/init";

export const appRoute = express.Router();
const OPEN_ROUTES: RegExp[] = [
    /^(\/shelters\/[^\/]+)$/,
    /^(\/shelters\/[^\/]+\/[^\/]+)$/,
    /^(\/shelters\/byProp\/[^\/]+\/[^\/]+)$/
];

appRoute.all(
    "/shelters*",
    createPermissionAppAPICheck(AuthService, OPEN_ROUTES)
);

appRoute
    .route("/shelters")
    .get(function (req, res) {
        const userData: Tools.ICodeInfo = getUserDataFilters(req.session);
        if (userData) {
            try {
                getAllIdsHead(userData)
                    .then(rif => {
                        if (rif) {
                            res.status(200).send(rif);
                        } else {
                            res.status(404).send({
                                error: "No Matcching Rifugio"
                            });
                        }
                    })
                    .catch(err => {
                        logger(LOG_TYPE.ERROR, err);
                        res.status(500).send({
                            error: "Invalid user or request"
                        });
                    });
            } catch (e) {
                logger(LOG_TYPE.ERROR, e);
                res.status(500).send({ error: "Invalid user or request" });
            }
        } else {
            res.status(500).send({ error: "Invalid user or request" });
        }
    })
    .post(function (req, res) {
        insertNewShelter(req.body)
            .then(shelter => {
                const id = shelter._id;
                delete shelter._id;
                res.status(200).send({ id: id, shelter: shelter });
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({ error: "Invalid user or request" });
            });
    });

appRoute.route("/shelters/country/:name").get(function (req, res) {
    const userData = getUserDataFilters(req.session);
    if (userData) {
        try {
            getShelByRegion(req.params.name, userData)
                .then(ris => {
                    res.status(200).send({ num: ris });
                })
                .catch(err => {
                    logger(LOG_TYPE.WARNING, err);
                    res.status(500).send({ error: "Invalid user or request" });
                });
        } catch (e) {
            logger(LOG_TYPE.ERROR, e);
            res.status(500).send({ error: "Invalid user or request" });
        }
    } else {
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute.route("/shelters/point").get(function (req, res) {
    const userData = getUserDataFilters(req.session);
    if (userData) {
        try {
            if (req.query.lat && req.query.lng && req.query.range) {
                getShelAroundPoint(
                    { lat: Number(req.query.lat), lng: Number(req.query.lng) },
                    Number(req.query.range),
                    userData
                )
                    .then(ris => {
                        res.status(200).send(ris);
                    })
                    .catch(err => {
                        logger(LOG_TYPE.WARNING, err);
                        res.status(500).send({
                            error: "Invalid user or request"
                        });
                    });
            } else {
                res.status(500).send({ error: "Invalid user or request" });
            }
        } catch (e) {
            logger(LOG_TYPE.ERROR, e);
            res.status(500).send({ error: "Invalid user or request" });
        }
    } else {
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute.route("/shelters/byProp/:prop/:value").get(async function (req, res) {
    try {
        const shel = await getShelterHeaderByProperty(
            req.params.prop,
            req.params.value
        );
        res.status(200).send(shel);
    } catch (err) {
        logger(LOG_TYPE.ERROR, err);
        res.status(500).send({
            error: "Invalid user or request"
        });
    }
});

appRoute
    .route("/shelters/:id")
    .get(function (req, res) {
        try {
            if (ObjectId.isValid(req.params.id)) {
                if (req.query.header) {
                    getShelterHeadById(req.params.id)
                        .then(rif => {
                            res.status(200).send(rif);
                        })
                        .catch(err => {
                            res.status(500).send({
                                error: "Invalid user or request"
                            });
                        });
                } else {
                    getShelterById(req.params.id)
                        .then(rif => {
                            if (rif != null) {
                                res.status(200).send(rif);
                            } else {
                                res.status(200).send({ _id: req.params.id });
                            }
                        })
                        .catch(err => {
                            res.status(500).send({
                                error: "Invalid user or request"
                            });
                        });
                }
            } else {
                res.status(500).send({ error: "Invalid shelter ID" });
            }
        } catch (e) {
            logger(LOG_TYPE.ERROR, e);
            res.status(500).send({ error: "Invalid user or request" });
        }
    })
    .put(async function (req, res) {
        try {
            const stagingItem = await StagingAreaTools.getStaginItemByShelId(
                req.params.id
            );
            if (req.query.confirm) {
                for (const prop in req.body) {
                    if (req.body.hasOwnProperty(prop)) {
                        stagingItem.shelter[prop] = req.body[prop];
                    }
                }
                StagingAreaTools.addStagingItem(stagingItem, req.session)
                    .then(() => {
                        res.status(200).send(true);
                    })
                    .catch(err => {
                        logger(LOG_TYPE.ERROR, err);
                        res.status(500).send({
                            error: "Invalid user or request"
                        });
                    });
            } else {
                updateShelter(
                    req.params.id,
                    req.body,
                    stagingItem && stagingItem.newItem
                )
                    .then(() => {
                        res.status(200).send(true);
                    })
                    .catch(err => {
                        logger(LOG_TYPE.WARNING, err);
                        res.status(500).send({
                            error: "Invalid user or request"
                        });
                    });
            }
        } catch (err) {
            if (!err) {
                const newShelter: IShelterExtended = req.body;
                newShelter._id = req.params.id;
                const stagingItem = {
                    watchDog: new Date(Date.now()),
                    shelter: newShelter,
                    files: null
                };

                try {
                    const item = await StagingAreaTools.addStagingItem(stagingItem, req.session);
                    res.status(200).send(true)
                } catch (e) {
                    logger(LOG_TYPE.ERROR, e);
                    res.status(500).send({
                        error: "Invalid user or request"
                    });
                }

            } else {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({ error: "Invalid user or request" });
            }
        }
    })
    .delete(function (req, res) {
        deleteShelter(req.params.id)
            .then(() => {
                res.status(200).send(true);
            })
            .catch(err => {
                res.status(500).send({ error: "Invalid user or request" });
            });
    });

appRoute.route("/shelters/confirm/:id").put(async function (req, res) {
    try {
        if (req.body.confirm !== undefined) {
            try {
                const stagingItem = await StagingAreaTools.getStaginItemByShelId(
                    req.params.id
                );
                if (req.body.confirm) {
                    confirmShelter(req.params.id)
                        .then(() => resolveFilesForShelter(stagingItem))
                        .then(val => StagingAreaTools.removeStagingItem(stagingItem))
                        .then(() => {
                            res.status(200).send(true);
                        })
                        .catch(async err => {
                            logger(LOG_TYPE.ERROR, err);
                            try {
                                await StagingAreaTools.removeStagingItem(stagingItem);
                            } catch (e) {
                                logger(LOG_TYPE.ERROR, e);
                            } finally {
                                res.status(500).send({
                                    error: "Invalid user or request"
                                });
                            }
                        });

                } else {
                    StagingAreaTools.removeStagingItem(stagingItem)
                        .then(() => {
                            res.status(200).send(true);
                        })
                        .catch(err => {
                            logger(LOG_TYPE.ERROR, err);
                            res.status(500).send({
                                error: "Invalid user or request"
                            });
                        });
                }
            } catch (err) {
                if (!err) {
                    res.status(200).send(true);
                } else {
                    logger(LOG_TYPE.ERROR, err);
                }
            }
        } else if (req.body.new) {
            const id = new ObjectId();
            const newShelter: any = { _id: id };

            const stagingItem = {
                watchDog: new Date(Date.now()),
                shelter: newShelter,
                files: null,
                newItem: true
            };

            try {
                const item = await StagingAreaTools.addStagingItem(stagingItem, req.session);
                res.status(200).send({ id: id })
            } catch (e) {
                logger(LOG_TYPE.ERROR, e);
                res.status(500).send({
                    error: "Invalid user or request"
                });
            }
        } else {
            res.status(500).send({ error: "Invalid user or request" });
        }
    } catch (e) {
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute.route("/shelters/confirm/:section/:id").put(async function (req, res) {
    try {
        try {
            const stagingItem = await StagingAreaTools.getStaginItemByShelId(
                req.params.id
            );

            await StagingAreaTools.updateStagingAreaShelterSection(req.params.id, req.body[req.params.section], req.params.section)
            res.status(200).send(true);
            
        } catch (err) {
            if (!err) {
                const newShelter: IShelterExtended = req.body;
                newShelter._id = req.params.id;

                const stagingItem = {
                    watchDog: new Date(Date.now()),
                    shelter: newShelter,
                    files: null
                };

                try {
                    const item = await StagingAreaTools.addStagingItem(stagingItem, req.session);
                    res.status(200).send(true)
                } catch (e) {
                    logger(LOG_TYPE.ERROR, e);
                    res.status(500).send({
                        error: "Invalid user or request"
                    });
                }

            } else {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({
                    error: "Invalid user or request"
                });
            }
        }
    } catch (e) {
        logger(LOG_TYPE.ERROR, e);
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute.route("/shelters/page/:pageSize").get(function (req, res) {
    try {
        getShelPage(0, req.params.pageSize)
            .then(ris => {
                res.status(200).send(ris);
            })
            .catch(err => {
                res.status(500).send({ error: err });
            });
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

appRoute.route("/shelters/page/:pageNumber/:pageSize").get(function (req, res) {
    try {
        getShelPage(req.params.pageNumber, req.params.pageSize)
            .then(ris => {
                res.status(200).send(ris);
            })
            .catch(err => {
                res.status(500).send({ error: "Invalid user or request" });
            });
    } catch (e) {
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute.route("/shelters/csv/list").get(function (req, res) {
    if (
        req.session &&
        req.session.role &&
        Auth_Permissions.Visualization.CSVPermission.indexOf(req.session.role) >
        -1
    ) {
        queryAllShelters()
            .then(shelters => createCSV(shelters))
            .then(csv => {
                const buff = Buffer.from(csv);
                res.status(200).send({ buff: buff });
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({ error: "Invalid user or request" });
            });
    } else {
        logger(LOG_TYPE.INFO, "User not authorized");
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute.route("/shelters/csv/:id").get(function (req, res) {
    if (
        req.session &&
        req.session.role &&
        Auth_Permissions.Visualization.CSVPermission.indexOf(req.session.role) >
        -1
    ) {
        getShelterById(req.params.id)
            .then(shelters => createCSV([shelters]))
            .then(csv => {
                const buff = Buffer.from(csv);
                res.status(200).send({ buff: buff });
            })
            .catch(err => {
                logger(LOG_TYPE.ERROR, err);
                res.status(500).send({ error: "Invalid user or request" });
            });
    } else {
        logger(LOG_TYPE.INFO, "User not authorized");
        res.status(500).send({ error: "Invalid user or request" });
    }
});

appRoute
    .route("/shelters/:id/:name")
    .get(async function (req, res) {
        try {
            let stagingItem = null;
            try {
                stagingItem = await StagingAreaTools.getStaginItemByShelId(
                    req.params.id
                );
                if (
                    stagingItem.shelter[req.params.name] &&
                    (!Array.isArray(stagingItem.shelter[req.params.name]) ||
                        stagingItem.shelter[req.params.name].lenght === 0)
                ) {

                    StagingAreaTools.updateWatchDog(req.params.id)
                        .then((updatedItem) => {
                            res.status(200).send(stagingItem.shelter);
                        })
                        .catch(err => {
                            logger(LOG_TYPE.ERROR, err);
                            res.status(500).send({
                                error: "Invalid user or request"
                            });
                        });
                } else {
                    const shel = await getShelSectionById(
                        req.params.id,
                        req.params.name
                    );
                    if (shel != null) {
                        res.status(200).send(shel);
                    } else {
                        res.status(200).send({ _id: req.params.id });
                    }
                }
            } catch (err) {
                try {
                    const shel = await getShelSectionById(
                        req.params.id,
                        req.params.name
                    );
                    if (shel != null) {
                        res.status(200).send(shel);
                    } else {
                        res.status(200).send({ _id: req.params.id });
                    }
                } catch (err) {
                    logger(LOG_TYPE.INFO, err);
                    res.status(500).send({ error: "Invalid user or request" });
                }
            }
        } catch (e) {
            logger(LOG_TYPE.WARNING, e);
            res.status(500).send({ error: "Invalid user or request" });
        }
    })
    .delete(function (req, res) {
        deleteService(req.params.name)
            .then(() => {
                res.status(200).send(true);
            })
            .catch(err => {
                logger(LOG_TYPE.INFO, err);
                res.status(500).send({ error: "Invalid user or request" });
            });
    });
