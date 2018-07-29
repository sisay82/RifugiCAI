import { Enums } from '../../../src/app/shared/types/enums';
import Auth_Permissions = Enums.Auth_Permissions;
import Files_Enum = Enums.Files;
import {
    IFileExtended,
    logger,
    LOG_TYPE,
    removeShelterToUpdate
} from '../../tools/common';
import { model, QueryCursor } from 'mongoose';
import { BCSchema } from '../../../src/app/shared/types/schema';
import { DISABLE_AUTH } from '../auth/auth.logic';
import { Buffer } from 'buffer';

const Files = model<IFileExtended>('Files', BCSchema.fileSchema);

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

export function insertNewFile(file: IFileExtended): Promise<{id: any, name: String, size: Number, type: any, contentType: String}> {
    return new Promise<{id: any, name: String, size: Number, type: any, contentType: String}>((resolve, reject) => {
        Files.create(file, (err, ris) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: ris._id,
                    name: ris.name,
                    size: ris.size,
                    type: ris.type,
                    contentType: ris.contentType
                });
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

export function queryFileByid(id): QueryCursor<IFileExtended> {
    return Files.findById(id).cursor();
}

export function queryFilesByshelterId(id, types?: Enums.Files.File_Type[]): Promise<IFileExtended[]> {
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

export function checkPermissionAPI(req, res, next) {
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
