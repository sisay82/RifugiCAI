import { IShelterExtended, IFileExtended, logger, LOG_TYPE } from "./common";
import { Enums } from "../../src/app/shared/types/enums";
import { CLEAR_CACHE_INTERVAL, MAX_TIME } from './constants';
import { Schema, model, Document } from "mongoose";
import { IFile, IShelter } from "../../src/app/shared/types/interfaces";
import { BCSchema } from "../../src/app/shared/types/schema";
import { Files } from "../API/files/files.logic";
import { ObjectID } from "bson";
import { getShelterById } from "../API/shelters/shelters.logic";

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

const StagingAreaModel = model<StagingInterfaces.StagingItemExtended>('StagingArea', stagingItemSchema);

export namespace StagingAreaTools {

    function updateBaseObject(base, updates) {
        for (const prop in updates) {
            if (updates[prop] && !(prop.startsWith('_') || prop.startsWith('$'))) {
                base[prop] = updates[prop];
            }
        }
        return base;
    }

    function removeEmptyArrays(base, item) {
        for (const prop in item) {
            if (!item[prop]) {
                delete(base[prop]);
            }
        }
        return base;
    }

    async function updateStagingItem(shelID: string, updatingItem: StagingInterfaces.StagingItem): Promise<StagingInterfaces.StagingItemExtended> {
        const updatingShelter = updatingItem.shelter;
        try {
            const baseItem = await getStaginItemByShelId(shelID);

            baseItem.shelter = baseItem.shelter
                ? updateBaseObject(baseItem.shelter, updatingShelter)
                : baseItem['shelter'] = <any>updatingShelter;

            baseItem.files = <any>updatingItem.files;

            return Promise.resolve(baseItem);

        } catch (e) {
            try {
                let baseShelter = await getShelterById(shelID);

                const updatedShelter = baseShelter
                    ? updateBaseObject(baseShelter, updatingShelter)
                    : baseShelter = <any>updatingShelter;

                const item = createStagingItem({
                    shelter: updatedShelter,
                    files: updatingItem.files,
                    watchDog: new Date(Date.now())
                });

                return Promise.resolve(item);
            } catch (err) {
                logger(LOG_TYPE.ERROR, err);
                return null;
            }
        }
    }

    function createStagingItem(item: StagingInterfaces.StagingItem) {
        if (!(<any>item)._id) {
            const stagingItem = new StagingAreaModel(item);
            return stagingItem
        }
        return null;
    }

    export async function removeStagingItemByShelID(shelID): Promise<void> {
        return StagingAreaModel.remove({ 'shelter._id': shelID }).exec();
    }

    export async function removeStagingItem(shelUpdate: StagingInterfaces.StagingItemExtended): Promise<void> {
        try {
            if (shelUpdate._id && shelUpdate.remove) {
                await shelUpdate.remove();
            }
            const shelID = String(shelUpdate.shelter._id) || shelUpdate.shelter.id;

            if (!shelID) {
                throw "Staging shelter to remove has no id";
            }

            await StagingAreaModel.remove({ 'shelter._id': shelID }).exec();
            return;
        } catch (err) {
            return Promise.reject(err);
        }
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

    export async function updateWatchDog(shelID) {
        return StagingAreaModel.updateOne({ "shelter._id": shelID }, { $set: { watchDog: new Date(Date.now()) } }).exec();
    }

    export async function updateStagingAreaShelterSection(shelID: string, section: object, sectionName: string) {
        return StagingAreaModel.updateOne({ 'shelter._id': shelID }, { $set: { ['shelter.' + sectionName]: section } }).exec();
    }

    export async function addStagingItem(updatingItem: StagingInterfaces.StagingItem, user)
        : Promise<StagingInterfaces.StagingItemExtended> {
        if (!user || !user.role) {
            return Promise.reject('USER AUTH ERROR');
        }

        try {
            const updatedStagingItem = await updateStagingItem(<string>updatingItem.shelter._id, updatingItem);
            updatedStagingItem.shelter.updateDate = new Date(Date.now());
            updatedStagingItem.shelter.updateSubject = <any>Enums.Auth_Permissions.UserTypeName[user.role];
            updatedStagingItem.watchDog = new Date(Date.now());

            return updatedStagingItem.save();
        } catch (err) {
            logger(LOG_TYPE.ERROR, err);
            return Promise.reject(err);
        }
    }

    export async function addFileAndSave(file: StagingInterfaces.StagingFileExtended, stagingItem: StagingInterfaces.StagingItemExtended, user) {
        try {
            file.new = true;
            if (stagingItem.files) {
                stagingItem.files = stagingItem.files.concat(file);
            } else {
                stagingItem.files = [file];
            }
            return addStagingItem(stagingItem, user)
                .then(() => file._id);

        } catch (err) {
            return Promise.reject(err);
        }
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
