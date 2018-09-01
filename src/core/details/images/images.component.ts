import {
    Component, Input, Directive, ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFile } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import { BcSharedService } from '../../../app/shared/shared.service';
import { BcDetailsService } from '../details.service';
import { DetailBase } from '../shared/detail_base';
import { Buffer } from 'buffer';

@Directive({
    selector: "[full-screen]",
    host: {
        "[class.bc-detail-img-full]": "enabled"
    }
})
export class BcResizeImgStyler {
    @Input("full-screen") enabled = false;
}

@Component({
    moduleId: module.id,
    selector: 'bc-img-detail',
    templateUrl: 'images.component.html',
    styleUrls: ['images.component.scss'],
    providers: [ShelterService],
    encapsulation: ViewEncapsulation.None
})
export class BcImg extends DetailBase {
    _id: String;
    fullScreenImgId = "";
    downloading = false;
    data: { file: IFile, url: any }[] = [];
    constructor(shelterService: ShelterService,
        shared: BcSharedService,
        _route: ActivatedRoute,
        router: Router,
        detailsService: BcDetailsService
    ) {
        super(_route, shared, router, detailsService, shelterService);
        shared.activeComponent = Enums.Routes.Routed_Component.images;
    }

    downloadFile(id) {
        this.shelterService.downloadFile(id);
    }

    isFullScreen(id) {
        return this.fullScreenImgId == id;
    }

    enlargeImage(id) {
        if (this.fullScreenImgId == id) {
            this.fullScreenImgId = "";
        } else {
            this.fullScreenImgId = id;
        }
    }

    getContentType(): any[] {
        return Object.keys(Enums.Files.Image_Type);
    }

    initImages(files) {
        let i = 0;
        const j = files.length;
        if (j > 0) {
            for (const file of files) {
                const queryFileSub = this.shelterService.getFile(file._id).subscribe(f => {
                    const data = Buffer.from(f.data);
                    const blob = new Blob([data], { type: <string>f.contentType });
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const src = reader.result;
                        this.data.push({ file: f, url: src });
                        i++;
                        if (i === j) {
                            this.downloading = false;
                        }
                    };
                    reader.readAsDataURL(blob);
                });
            }
        } else {
            this.downloading = false;
        }
    }

    init(shelId) {
        this.downloading = true;
        this.getDocs(shelId, [Enums.Files.File_Type.image])
            .then(files => {
                this.initImages(files);
            });
    }
}
