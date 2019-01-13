import { Enums } from '../../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import Files_Enum = Enums.Files;
import {
    IFileExtended,
    logger,
    LOG_TYPE,
    ObjectId,
    getRegExpListResult
} from '../../tools/common';
import { model } from 'mongoose';
import { BCSchema } from '../../../src/app/shared/types/schema';
import { Buffer } from 'buffer';
import { StagingAreaTools, StagingInterfaces } from '../../tools/stagingArea';
import { IFile } from '../../../src/app/shared/types/interfaces';
import { DISABLE_AUTH } from '../../tools/constants';
import { Request, Response } from 'express';
import { CasAuth } from '../auth/auth.cas';

export const Files = model<IFileExtended>('Files', BCSchema.fileSchema);

export const MAX_IMAGES = 10;

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

export function insertFileFromStagingArea(file: StagingInterfaces.StagingFileExtended) {
    if ((<any>file)._doc) {
        return insertNewFile((<any>file)._doc);
    } else {
        return Promise.reject('ERR OBJECT NOT FROM MONGO');
    }
}

export function insertNewFile(file: IFile)
    : Promise<{ id: any, name: String, size: Number, type: any, contentType: String }> {
    return new Promise<any>((resolve, reject) => {
        const f = new Files(file);
        f.save((err, ris) => {
            if (err) {
                reject(err);
            } else {
                const retFile = {
                    id: ris._id,
                    name: ris.name,
                    size: ris.size,
                    type: ris.type,
                    contentType: ris.contentType
                };
                resolve(retFile);
            }
        });
    })

}

function isValidFile(file): boolean {
    if (file.type === Enums.Files.File_Type.invoice) {
        if (file.value &&
            file.invoice_year &&
            file.invoice_tax &&
            file.invoice_type &&
            (
                file.invoice_type !== <any>Enums.Invoice_Type.att ||
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

function resolveFile(file: StagingInterfaces.StagingFileExtended): Promise<any> {
    if (isValidFile(file)) {
        if (file.toRemove) {
            return deleteFile(file._id);
        } else {
            if (!file.new && file.toUpdate) {
                return updateFile(file._id, file);
            } else if (file.new) {
                return insertFileFromStagingArea(file);
            } else {
                return Promise.reject('ERR NO ACTION ON FILE')
            }
        }
    } else {
        return Promise.resolve();
    }
}

export function resolveFilesForShelter(shelter: StagingInterfaces.StagingItemExtended): Promise<any> {
    if (shelter.files != null) {
        const promises = [];
        shelter.files.forEach(file => {
            promises.push(resolveFile(file));
        });

        return Promise.all(promises);
    } else {
        return Promise.resolve();
    }
}

export function queryAllFiles(): Promise<IFileExtended[]> {
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

export function queryFileMetaByid(id): Promise<IFileExtended> {
    return new Promise<IFileExtended>((resolve, reject) => {
        Files.findById(id, 'name size contentType')
            .exec((err, ris) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ris);
                }
            });
    });
}

export function queryFileByid(id): Promise<IFileExtended> {
    return new Promise<IFileExtended>((resolve, reject) => {
        Files.findById(id).exec((err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve(ris);
            }
        });
    });
}

export function queryFilesByshelterId(id, types?: Enums.Files.File_Type[]): Promise<IFileExtended[]> {
    return new Promise<IFileExtended[]>((resolve, reject) => {
        const query = types && Array.isArray(types)
            ? { 'shelterId': id, type: { $in: types } }
            : { 'shelterId': id };

        Files.find(query,
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

export function updateFile(id: any, file): Promise<boolean> {
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

        Files.findByIdAndUpdate(id, query).exec((err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

export function deleteFile(id): Promise<boolean> {
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

export function queryAllFilesByType(types): Promise<IFileExtended[]> {
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

export function createPermissionFileAPICheck(authService: CasAuth, openGetRoutes: RegExp[]) {
    return (req: Request, res: Response, next) => {
        if (req.method === 'GET' && getRegExpListResult(openGetRoutes, req.path)) {
            authService.soft_block(req, res, () => {
                next();
            });
        } else {
            authService.block(req, res, () => {
                checkPermissionAPI(req, res, next);
            });
        }
    }
}

function checkPermissionAPI(req: Request, res: Response, next) {
    if (DISABLE_AUTH) {
        next();
    } else {
        if (req.session) {
            if (req.method === 'GET') {
                next();
            } else {
                if (req.method === 'DELETE' || req.method === 'POST' || req.method === 'PUT') {
                    if (Auth_Permissions.Revision.DocRevisionPermission.find(obj => obj === req.session.role)) {
                        next();
                    } else {
                        res.sendStatus(401);
                    }
                } else {
                    res.status(501).send({ error: 'Not Implemented method ' + req.method });
                }
            }
        } else {
            res.sendStatus(401);
        }
    }
}


export function mergeFiles(objA: IFileExtended, objB: StagingInterfaces.StagingFile) {
    if (objA && objB && (<any>objA)._doc && (<any>objB)._doc) {
        for (const prop in (<any>objA)._doc) {
            if (!prop.startsWith('_') &&
                (<any>objB)._doc[prop] &&
                objB[prop]) {
                objA[prop] = objB[prop];
            }
        }
        if (objB.toUpdate != null) {
            (<any>objA).toUpdate = objB.toUpdate;
        }
        if (objB.new != null) {
            (<any>objA).new = objB.new;
        }
        if (objB.toRemove != null) {
            (<any>objA).toRemove = objB.toRemove;
        }
    }
    return objA;
}


export function intersectFilesArray(stagingArray: StagingInterfaces.StagingFileExtended[], files: IFileExtended[]) {
    const updFiles = stagingArray.filter(obj => obj.toUpdate);
    const retFiles = files.filter(obj => {
        const fstaging = stagingArray.find(o => String(o._id) === String(obj._id));
        return !fstaging || !fstaging.toRemove;
    })
        .concat(
            stagingArray.filter(obj => obj.new)
        );

    return retFiles.map(file => {
        const updFile = updFiles.find(upd =>
            String(upd._id) === String(file._id)
        );
        return mergeFiles(file, updFile);
    });
}

export function resolveStagingAreaFiles(file: StagingInterfaces.StagingFileExtended, user): Promise<String> {
    const shelId = file.shelterId;
    const fileid = new ObjectId();
    file._id = <any>fileid;
    file.new = true;
    return new Promise<String>((resolve, reject) => {
        StagingAreaTools.getStaginItemByShelId(shelId)
            .then(stagingItem => {
                if (file.type === Files_Enum.File_Type.image) {
                    queryFilesByshelterId(shelId)
                        .then(files => Promise.resolve(files.filter(obj => obj.type === Files_Enum.File_Type.image)))
                        .catch(e => Promise.resolve(stagingItem.files))
                        .then(images => {
                            if (images.length < MAX_IMAGES &&
                                (!stagingItem.files || images.length + stagingItem.files.length < MAX_IMAGES)
                            ) {
                                return StagingAreaTools.addFileAndSave(file, stagingItem);
                            } else {
                                reject('Max ' + MAX_IMAGES + ' images');
                            }
                        })
                        .then(fid => { resolve(fid) })
                        .catch(err => { reject(err) });
                } else {
                    StagingAreaTools.addFileAndSave(file, stagingItem)
                        .then(fid => { resolve(fid) })
                        .catch(err => { reject(err) });
                }
            })
            .catch(e => {
                if (!e) {
                    if (file.type === Files_Enum.File_Type.image) {
                        queryFilesByshelterId(shelId)
                            .then(files => {
                                const images = files.filter(obj => obj.type === Files_Enum.File_Type.image);
                                if (images.length < MAX_IMAGES) {
                                    const newShelter = StagingAreaTools.createStagingItem({
                                        shelter: { _id: shelId },
                                        watchDog: new Date(Date.now()),
                                        files: [file]
                                    });
                                    return StagingAreaTools.addStagingItem(newShelter, user);
                                } else {
                                    reject('Max ' + MAX_IMAGES + ' images')
                                }
                            })
                            .catch(error => {
                                const stagingItem = StagingAreaTools.createStagingItem({
                                    watchDog: new Date(Date.now()),
                                    shelter: { _id: shelId },
                                    files: [file]
                                });
                                return StagingAreaTools.addStagingItem(stagingItem, user);
                            })
                            .then(item => { resolve(item.files[0].id) })
                            .catch(err => { reject(err) });
                    } else {
                        const stagingItem = StagingAreaTools.createStagingItem({
                            watchDog: new Date(Date.now()),
                            shelter: { _id: shelId },
                            files: [file]
                        });

                        StagingAreaTools.addStagingItem(stagingItem, user)
                            .then(item => {
                                resolve(item.files[0].id)
                            })
                            .catch(err => {
                                reject(err)
                            });
                    }
                } else {
                    reject(e);
                }
            });
    });
}

export function filterStagingFile(file: StagingInterfaces.StagingFileExtended, types: Enums.Files.File_Type[]) {
    return (types.indexOf(file.type) >= 0) || file.toRemove || file.toUpdate;
}
