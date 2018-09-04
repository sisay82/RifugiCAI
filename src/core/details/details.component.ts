import { Component, Input, OnDestroy } from '@angular/core';
import { IShelter, IFile } from '../../app/shared/types/interfaces';
import { BcDetailsService } from './details.service';
import { Enums } from '../../app/shared/types/enums';
import { Subscription } from 'rxjs';
import { BcSharedService } from '../../app/shared/shared.service';
import { BcDataBaseService } from '../services/data.base.service';

@Component({
    moduleId: module.id,
    selector: 'bc-details',
    styleUrls: ['details.component.scss'],
    templateUrl: 'details.component.html',
    providers: [BcDetailsService, BcDataBaseService]
})
export class BcDetails implements OnDestroy {
    loadSub: Subscription;
    saveSub: Subscription;
    subscriptions: Subscription[] = [];

    constructor(private detailsService: BcDetailsService,
        private shared: BcSharedService,
        private dataService: BcDataBaseService) {
        this.subscriptions.push(
            shared.activeOutletChange$.subscribe((outlet) => {
                if (outlet === Enums.Routes.Routed_Outlet.revision) {
                    dataService.initStorage();
                }
            }),
            detailsService.saveFiles$.subscribe(files => {
                dataService.saveLoadedFiles(files);
            }),
            detailsService.loadFilesRequest$.subscribe(types => {
                const files = dataService.loadFiles(types);
                this.detailsService.onChildLoadFiles(files);
            }),
            detailsService.save$.subscribe(obj => {
                dataService.saveShelter(obj);
            }),
            detailsService.loadRequest$.subscribe(section => {
                this.detailsService.onChildLoad(dataService.loadShelter(section));
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
