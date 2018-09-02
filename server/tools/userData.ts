
import { Enums } from '../../src/app/shared/types/enums';
import { Schema, model, Document } from 'mongoose';
import Auth_Permissions = Enums.Auth_Permissions;
import { logger, LOG_TYPE } from './common';


export interface UserData {
    sid: String;
    resource?: String;
    ticket?: String;
    uuid?: String;
    code?: String;
    role?: Auth_Permissions.User_Type;
    redirections: number;
    checked: boolean;
}

export interface UserDataExtended extends UserData, Document {
    _id: String;
}

export const userDataSchema = new Schema({
    sid: { type: String, required: true },
    resource: String,
    ticket: String,
    uuid: String,
    code: String,
    role: { type: Enums.Auth_Permissions.Region_Code },
    redirections: Number,
    checked: Boolean
});

const UserDataModel = model<UserDataExtended>('UserData', userDataSchema);

export namespace UserDataTools {
    export function getUserData(sid): Promise<UserDataExtended> {
        return new Promise<UserDataExtended>((resolve, reject) => {
            UserDataModel.findOne({ sid: sid }).exec((err, res) => {
                err || !res ? reject(err) : resolve(res);
            });
        });
    }

    export function updateUserData(user: UserData): Promise<UserDataExtended> {
        return new Promise<UserDataExtended>((resolve, reject) => {
            const upsert = (<any>user).__v == null;
            UserDataModel.findOneAndUpdate({ sid: user.sid }, user, { upsert: upsert, new: true }).exec((err, res) => {
                err ? reject(err) : resolve(res);
            });
        });
    }

    export function deleteDataSession(sid: String): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            UserDataModel.deleteOne({ sid: sid }).exec((err) => {
                err ? reject(err) : resolve();
            });
        })
    }

    export function updateUserAndSend(
        user: UserData,
        callback: (updatedUser?: UserDataExtended) => void,
        errCallback?: (err?: any) => void
    ) {
        updateUserData(user)
            .then(userData => {
                callback(userData);
            })
            .catch(err => {
                if (errCallback) {
                    logger(LOG_TYPE.ERROR, 'Error while updating user data', err);
                    errCallback(err);
                } else {
                    logger(LOG_TYPE.WARNING, 'Unhandeled userDataUpdate error', err);
                }
            })
    }
}
