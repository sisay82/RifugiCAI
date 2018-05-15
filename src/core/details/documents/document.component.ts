import {
    Component, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IFile } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcDetailsService } from '../details.service';
import { DetailBase } from '../shared/detail_base';

@Component({
    moduleId: module.id,
    selector: 'bc-doc-detail',
    templateUrl: 'document.component.html',
    styleUrls: ['document.component.scss'],
    providers: [ShelterService]
})
export class BcDoc extends DetailBase {
    _id: String;
    docs: IFile[] = [];
    maps: IFile[] = [];
    invoices: IFile[] = [];
    constructor(shelterService: ShelterService,
        shared: BcSharedService,
        _route: ActivatedRoute,
        router: Router,
        detailsService: BcDetailsService
    ) {
        super(_route, shared, router, detailsService, shelterService);
        shared.activeComponent = Enums.Routes.Routed_Component.documents;
    }

    downloadFile(id) {
        const queryFileSub = this.shelterService.getFile(id).subscribe(file => {
            const e = document.createEvent('MouseEvents');
            const blob = new Blob([new Uint8Array(file.data.data)], { type: <string>file.contentType });
            const a = document.createElement('a');
            a.download = <string>file.name;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = [file.contentType, a.download, a.href].join(':');
            e.initEvent('click', true, false);
            a.dispatchEvent(e);
            if (queryFileSub) {
                queryFileSub.unsubscribe();
            }
        });
    }

    getTotal(value, tax) {
        if (tax > 1) {
            return (value * (tax / 100)) + value;
        } else {
            return (value * tax) + value;
        }
    }

    getExtension(filename: String) {
        const parts = filename.split('.');
        return parts[parts.length - 1];
    }

    checkExtension(value: String, types: String[]) {
        return types.includes(value)
    }

    getIcon(type, name) {
        if (type == Enums.Files.File_Type.doc) {
            if (this.checkExtension(this.getExtension(name), ["doc", "docx"])) {
                return "file-word-o"
            } else if (this.checkExtension(this.getExtension(name), ["xls", "xlsx"])) {
                return "file-excel-o"
            } else if (this.checkExtension(this.getExtension(name), ["txt"])) {
                return "file-text-o"
            } else if (this.checkExtension(this.getExtension(name), ["pdf"])) {
                return "file-pdf-o"
            } else { return "file-text-o"; }
        } else if (type == Enums.Files.File_Type.map) {
            if (this.checkExtension(this.getExtension(name), ["dwg"])) {
                return "map-o"
            } else if (this.checkExtension(this.getExtension(name), ["pdf"])) {
                return "file-pdf-o"
            } else {
                return "file-text-o";
            }
        } else if (type == Enums.Files.File_Type.invoice) {
            if (this.checkExtension(this.getExtension(name), ["doc", "docx"])) {
                return "file-word-o"
            } else if (this.checkExtension(this.getExtension(name), ["xls", "xlsx"])) {
                return "file-excel-o"
            } else if (this.checkExtension(this.getExtension(name), ["txt"])) {
                return "file-text-o"
            } else if (this.checkExtension(this.getExtension(name), ["pdf"])) {
                return "file-pdf-o"
            } else { return "file-text-o"; }
        } else if (type == Enums.Files.File_Type.contribution) {
            return "file-pdf-o"
        } else {
            return "file-text-o"
        }
    }

    initDocs(files) {
        for (const file of files) {
            if (file.type != null) {
                if (file.type === Enums.Files.File_Type.contribution || file.type === Enums.Files.File_Type.doc) {
                    this.docs.push(file);
                } else if (file.type === Enums.Files.File_Type.map) {
                    this.maps.push(file);
                } else if (file.type === Enums.Files.File_Type.invoice) {
                    this.invoices.push(file);
                }
            }
        }
    }

    init(shelId) {
        this.getDocs(shelId,
            [
                Enums.Files.File_Type.doc,
                Enums.Files.File_Type.map,
                Enums.Files.File_Type.invoice,
                Enums.Files.File_Type.contribution
            ]
        )
            .then(files => {
                this.initDocs(files);
            });
        /*const loadServiceSub = this.detailsService.loadFiles$.subscribe(files => {
            if (!files) {
                const queryFileSub = this.shelterService.getFilesByShelterId(shelId).subscribe(files => {
                    this.initDocs(files);
                    this.detailsService.onChildSaveFiles(files);
                    if (queryFileSub != undefined) {
                        queryFileSub.unsubscribe();
                    }
                });
            } else {
                this.initDocs(files);
            }
            if (loadServiceSub != undefined) {
                loadServiceSub.unsubscribe();
            }
        });
        this.detailsService.onChildLoadFilesRequest([Enums.Files.File_Type.doc,
            Enums.Files.File_Type.map, Enums.Files.File_Type.invoice, Enums.Files.File_Type.contribution]);*/
    }
}
