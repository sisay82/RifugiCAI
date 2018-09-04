import { Component, OnDestroy } from '@angular/core';
import { IShelter, IFile } from '../../app/shared/types/interfaces';
import { Enums } from '../../app/shared/types/enums';
import { BcRevisionsService } from './revisions.service';
import { BcSharedService } from '../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { Router, RoutesRecognized } from '@angular/router';
import { BcAuthService } from '../../app/shared/auth.service';
import { BcDataBaseService } from '../services/data.base.service';

@Component({
    moduleId: module.id,
    selector: 'bc-revisions',
    templateUrl: 'revisions.component.html',
    styleUrls: ['revisions.component.scss'],
    providers: [BcRevisionsService, BcDataBaseService]
})
export class BcRevisions implements OnDestroy {
    subscriptions: Subscription[] = [];
    localPermissions: any[];

    constructor(private revisionService: BcRevisionsService,
        private shared: BcSharedService,
        private authService: BcAuthService,
        private dataService: BcDataBaseService) {
        this.subscriptions.push(
            authService.getPermissions().subscribe(permissions => {
                this.localPermissions = permissions;
                revisionService.onFatherReturnPermissions(this.localPermissions);
                this.subscriptions.push(revisionService.childGetPermissions$.subscribe(() => {
                    revisionService.onFatherReturnPermissions(this.localPermissions);
                }));
            }),
            shared.activeOutletChange$.subscribe((outlet) => {
                if (outlet === Enums.Routes.Routed_Outlet.content) {
                    dataService.initStorage();
                }
            }),
            revisionService.save$.subscribe(obj => {
                dataService.saveShelter(obj);
            }),
            revisionService.loadRequest$.subscribe(section => {
                this.revisionService.onChildLoad(dataService.loadShelter(section));
            }),
            revisionService.saveFile$.subscribe(obj => {
                dataService.updateFile(obj.file, obj.remove);
            }),
            revisionService.saveFiles$.subscribe(files => {
                dataService.saveLoadedFiles(files);
            }),
            revisionService.loadFilesRequest$.subscribe(types => {
                const files = dataService.loadFiles(types);
                this.revisionService.onChildLoadFiles(files);

            }),
            shared.maskSave$.subscribe(() => {
                dataService.initStorage();
            }),
            shared.maskCancel$.subscribe(() => {
                dataService.initStorage();
                const disableSaveSub = this.revisionService.childDisableSaveAnswer$.subscribe(() => {
                    shared.onMaskConfirmCancel();
                    if (disableSaveSub) {
                        disableSaveSub.unsubscribe();
                    }
                });
                this.revisionService.onChildDisableSaveRequest();
            }),
            revisionService.childDelete$.subscribe(section => {
                dataService.deleteSection(section);
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            if (sub) {
                sub.unsubscribe();
            }
        });
    }
}
