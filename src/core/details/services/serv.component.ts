import {
    Component, Input, OnInit
} from '@angular/core';
import { IService, ITag, IShelter } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BcSharedService, serviceBaseList } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { BcDetailsService } from '../details.service';
import { Enums } from '../../../app/shared/types/enums';
import { DetailBase } from '../shared/detail_base';

@Component({
    moduleId: module.id,
    selector: 'bc-serv',
    templateUrl: 'serv.component.html',
    styleUrls: ['serv.component.scss'],
    providers: [ShelterService]
})
export class BcServ extends DetailBase {
    services: IService[] = [];
    activeComponentSub: Subscription;
    constructor(shelterService: ShelterService,
        _route: ActivatedRoute,
        shared: BcSharedService,
        router: Router,
        detailsService: BcDetailsService
    ) {
        super(_route, shared, router, detailsService, shelterService);
        shared.activeComponent = Enums.Routes.Routed_Component.services;
    }


    initServices(services) {
        if (!services) {
            services = [];
        }
        for (const serviceEntry of serviceBaseList) {
            const s: IService = {}
            s.category = serviceEntry.serviceName;
            s.tags = [] as [ITag];
            const serv = services.find(obj => obj.category && obj.category === s.category);
            for (const tagEntry of serviceEntry.tags) {
                const tag = { key: tagEntry.name, value: null, type: tagEntry.type };
                if (serv) {
                    s._id = serv._id;
                    const t = serv.tags.find(obj => obj.key === tag.key);
                    if (t) {
                        tag.value = t.value;
                    }
                }
                s.tags.push(tag);
            }
            this.services.push(s);
        }
    }

    getEmptyObjData(section) {
        return [];
    }

    /*getService(id): Promise<IShelter> {
        return new Promise<IShelter>((resolve, reject) => {
            let detSub = this.detailsService.load$.subscribe(shelter => {
                if (shelter != null && shelter.services != undefined) {
                    if (detSub != undefined) {
                        detSub.unsubscribe();
                    }
                    resolve(shelter);
                } else {
                    let shelSub = this.shelterService.getShelterSection(id, "services").subscribe(shelter => {
                        if (shelter.services == undefined) shelter.services = [] as [IService];
                        this.detailsService.onChildSave(shelter, "services");
                        if (shelSub != undefined) {
                            shelSub.unsubscribe();
                        }
                        if (detSub != undefined) {
                            detSub.unsubscribe();
                        }
                        resolve(shelter);
                    });
                }
            });
            this.detailsService.onChildLoadRequest("services");
        });
    }*/

    init(shelId) {
        this.getData(shelId, "services")
        .then(shelter => {
            this.initServices(shelter.services);
        });
        /*this.getService(shelId)
            .then(shelter => {
                this.initServices(shelter.services);
            });*/
    }
}
