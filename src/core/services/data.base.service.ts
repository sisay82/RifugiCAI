import { Injectable } from '@angular/core';
import { IFile, IShelter } from '../../../src/app/shared/types/interfaces';
import { Enums } from '../../../src/app/shared/types/enums';

@Injectable()
export class BcDataBaseService {
    docs: IFile[];
    images: IFile[];
    typesRequested: Enums.Files.File_Type[];
    shelter: IShelter;

    initStorage() {
        this.docs = null;
        this.images = null;
        this.shelter = null;
        this.typesRequested = [];
    }

    checkDocTypes(types: Enums.Files.File_Type[]): boolean {
        return (
            types.includes(Enums.Files.File_Type.doc) ||
            types.includes(Enums.Files.File_Type.map) ||
            types.includes(Enums.Files.File_Type.invoice)
        );
    }

    addTypeToRequested(type: Enums.Files.File_Type) {
        if (this.typesRequested != null && Array.isArray(this.typesRequested)) {
            if (!this.typesRequested.includes(type)) {
                this.typesRequested.push(type);
            }
        } else {
            this.typesRequested = [type]
        }
    }

    updateFileLocal(storage: IFile[], file: IFile, remove?: Boolean): IFile[] {
        if (storage) {
            if (remove) {
                const f = storage.find(f => f._id == file._id);
                if (f) {
                    storage.splice(storage.indexOf(f), 1);
                }
            } else {
                const fIndex = storage.findIndex(f => f._id == file._id);
                if (fIndex > -1) {
                    storage[fIndex] = file;
                } else {
                    storage.push(file);
                }
            }
        } else {
            if (!remove) {
                storage = [file];
            }
        }
        return storage
    }

    checkRequestedTypes(types: Enums.Files.File_Type[]): boolean {
        return this.typesRequested != null &&
            Array.isArray(this.typesRequested) &&
            this.typesRequested
                .filter(type => types.includes(type))
                .length === types.length
    }

    saveLoadedFiles(files) {
        for (const file of files) {
            this.addTypeToRequested(file.type);
            if (file.type === Enums.Files.File_Type.image) {
                this.images = this.updateFileLocal(this.images, file);
            } else {
                this.docs = this.updateFileLocal(this.docs, file);
            }
        }
    }

    loadFiles(types: Enums.Files.File_Type[]): IFile[] {
        let files: IFile[] = [];
        let retNull = false;
        if (this.checkRequestedTypes(types)) {
            if (this.docs && this.checkDocTypes(types)) {
                files = files.concat(this.docs.filter(f => types.includes(f.type)));
            } else {
                if (this.images && types.includes(Enums.Files.File_Type.image)) {
                    retNull = false;
                    files = files.concat(this.images.filter(f => types.includes(f.type)));
                } else {
                    retNull = true;
                }
            }
        } else {
            retNull = true;
        }

        if (retNull) {
            return null;
        } else {
            return files;
        }
    }

    saveShelter(obj: { section: string; shelter: IShelter }) {
        if (this.shelter) {
            this.shelter[obj.section] = obj.shelter[obj.section];
        } else {
            this.shelter = obj.shelter;
        }
    }

    loadShelter(section: string): IShelter {
        if (this.shelter && this.shelter[section]) {
            return this.shelter;
        } else {
            return null;
        }
    }

    deleteSection(section: string) {
        if (this.shelter && this.shelter.hasOwnProperty(section)) {
            this.shelter[section] = null;
        }
    }


    updateFile(file: IFile, remove?: Boolean) {
        if (file.type === Enums.Files.File_Type.image) {
            this.images = this.updateFileLocal(this.images, file, remove);
        } else {
            this.docs = this.updateFileLocal(this.docs, file, remove);
        }
    }

    constructor() { }

}
