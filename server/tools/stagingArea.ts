import { IShelterExtended, IFileExtended } from "./common";
import { Enums } from "../../src/app/shared/types/enums";
import { UserData } from "../API/auth/userData";
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
        BCSchema.shelterSchema.obj
    ),
    files: [Object.assign(
        {},
        BCSchema.fileSchema.obj,
        { new: Boolean, roRemove: Boolean, toUpdate: Boolean }
    )],
    newItem: Boolean
});

export const StagingAreaModel = model<StagingInterfaces.StagingItemExtended>('StagingArea', stagingItemSchema);

export namespace StagingAreaTools {
    export function removeShelterToUpdate(shelUpdate: StagingInterfaces.StagingItemExtended): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (shelUpdate._id && shelUpdate.remove) {
                shelUpdate.remove()
                    .then(() => resolve())
                    .catch(err => reject(err));
            }
            StagingAreaModel.findOneAndRemove({ 'shelter.shelter._id': shelUpdate.shelter.id }).exec((err, ris) => {
                err ? reject(err) : resolve();
            })
        });
    }

    export function getStaginItemByShelId(id: String): Promise<StagingInterfaces.StagingItemExtended> {
        return new Promise<StagingInterfaces.StagingItemExtended>((resolve, reject) => {
            StagingAreaModel.findOne({ 'shelter.shelter._id': id }).exec((err, res) => {
                err || !res ? reject(err) : resolve(res);
            });
        })
    }

    export function addStagingItem(updatingShelter: StagingInterfaces.StagingItem, user: UserData)
        : Promise<StagingInterfaces.StagingItemExtended> {
        return new Promise<StagingInterfaces.StagingItemExtended>((resolve, reject) => {
            if (!user || !user.role) {
                return reject();
            }

            updatingShelter.shelter.updateSubject = <any>Enums.Auth_Permissions.UserTypeName[user.role];
            updatingShelter.watchDog = new Date(Date.now());
            return StagingAreaModel.create(updatingShelter);
        })
    }

    export function addFileAndSave(file: StagingInterfaces.StagingFile, stagingItem: StagingInterfaces.StagingItemExtended) {
        return new Promise<ObjectID>((resolve, reject) => {
            try {
                const fileExt = new Files(file)
                if (stagingItem.files) {
                    stagingItem.files.push(fileExt);
                } else {
                    stagingItem.files = [fileExt];
                }
                stagingItem.watchDog = new Date(Date.now());
                stagingItem.save();
                resolve(fileExt.id);
            } catch (err) {
                reject(err);
            }
        });
    }
}

function cleanSheltersToUpdate() {
    StagingAreaModel.remove({
        watchDog: {
            $gte: Date.now() - MAX_TIME
        }
    });
}

setInterval(cleanSheltersToUpdate, CLEAR_CACHE_INTERVAL);
