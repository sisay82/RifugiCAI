import {
    Component, Input, OnInit
} from '@angular/core';
import { IService, ITag, IShelter } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BcSharedService, serviceBaseList } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
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
            s.tags = [] as any;
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

    init(shelId) {
        this.getData(shelId, "services")
            .then(shelter => {
                this.initServices(shelter.services);
            });
    }
}
