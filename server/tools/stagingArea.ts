import { IShelterExtended, IFileExtended, logger, LOG_TYPE } from "./common";
import { Enums } from "../../src/app/shared/types/enums";
import { CLEAR_CACHE_INTERVAL, MAX_TIME } from './constants';
import { Schema, model, Document } from "mongoose";
import { IFile, IShelter } from "../../src/app/shared/types/interfaces";
import { BCSchema } from "../../src/app/shared/types/schema";
import { Files } from "../API/files/files.logic";
import { ObjectID } from "bson";

export namespace StagingInterfaces {
    export interface StagingShelter extends IShelter { }

    export interface StagingShelterExtended extends IShelterExtended { }

    export interface StagingFile extends IFile {
        new?: Boolean;
        toRemove?: Boolean;
        toUpdate?: Boolean;
    }

    export interface StagingFileExtended extends IFileExtended {
        new?: Boolean;
        toRemove?: Boolean;
        toUpdate?: Boolean;
    }

    export interface StagingItem {
        watchDog: Date;
        shelter: StagingShelter;
        files: StagingFile[];
        newItem?: Boolean;
    }

    export interface StagingItemExtended extends StagingItem, Document {
        _id: String;
        shelter: StagingShelterExtended;
        files: StagingFileExtended[];
    }
}

const stagingItemSchema = new Schema({
    watchDog: { type: Date, default: Date.now },
    shelter: Object.assign(
        {},
        BCSchema.shelterSchema.obj,
        { _id: String, services: [BCSchema.serviceSchema.obj] }
    ),
    files: [Object.assign(
        {},
        BCSchema.fileSchema.obj,
        { _id: String, new: Boolean, toRemove: Boolean, toUpdate: Boolean }
    )],
    newItem: Boolean
});

export const StagingAreaModel = model<StagingInterfaces.StagingItemExtended>('StagingArea', stagingItemSchema);

export namespace StagingAreaTools {
    export function removeStagingItem(shelUpdate: StagingInterfaces.StagingItemExtended): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (shelUpdate._id && shelUpdate.remove) {
                shelUpdate.remove()
                    .then(() => resolve())
                    .catch(err => reject(err));
            }
            StagingAreaModel.findOneAndRemove({ 'shelter._id': shelUpdate.shelter.id }).exec((err, ris) => {
                err ? reject(err) : resolve();
            })
        });
    }

    export function getStaginItemByShelId(id: String): Promise<StagingInterfaces.StagingItemExtended> {
        return new Promise<StagingInterfaces.StagingItemExtended>((resolve, reject) => {
            StagingAreaModel.findOne({ 'shelter._id': id }).exec((err, res) => {
                if (err || !res) {
                    reject(err)
                } else {
                    resolve(res);
                }
            });
        })
    }

    export function addStagingItem(updatingShelter: StagingInterfaces.StagingItem, user)
        : Promise<StagingInterfaces.StagingItemExtended> {
        if (!user || !user.role) {
            return Promise.reject('USER AUTH ERROR');
        }

        updatingShelter.shelter.updateSubject = <any>Enums.Auth_Permissions.UserTypeName[user.role];
        updatingShelter.watchDog = new Date(Date.now());
        return new Promise<StagingInterfaces.StagingItemExtended>((resolve, reject) => {
            const item = new StagingAreaModel(updatingShelter);
            item.save((err, el) => {
                if (!err) {
                    resolve(el);
                } else {
                    reject(err);
                }
            });
        });
    }

    export function addItemAndSend(updatingShelter: StagingInterfaces.StagingItem,
        user,
        callback: (item: StagingInterfaces.StagingItemExtended) => void,
        errCallback?: (err: String) => void) {
        addStagingItem(updatingShelter, user)
            .then(item => callback(item))
            .catch(err => {
                if (errCallback) {
                    errCallback(err);
                } else {
                    logger(LOG_TYPE.ERROR, err);
                }
            })
    }

    export function addFileAndSave(file: StagingInterfaces.StagingFileExtended, stagingItem: StagingInterfaces.StagingItemExtended) {
        return new Promise<String>((resolve, reject) => {
            try {
                file.new = true;
                if (stagingItem.files) {
                    stagingItem.files = stagingItem.files.concat(file);
                } else {
                    stagingItem.files = [file];
                }
                stagingItem.watchDog = new Date(Date.now());
                stagingItem.save((err, ris) => {
                    if (!err) {
                        resolve(file._id);
                    } else {
                        reject(err);
                    }
                });

            } catch (err) {
                reject(err);
            }
        });
    }
}

export function cleanSheltersToUpdate() {
    StagingAreaModel.remove({
        watchDog: {
            $lte: new Date(Date.now() - MAX_TIME)
        }
    }).exec(err => {
        if (err) {
            logger(LOG_TYPE.ERROR, err);
        }
    });
}
