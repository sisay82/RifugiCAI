import {
    Component, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ICatastal, IDrain, IEnergy, IShelter } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcDetailsService } from '../details.service';
import { DetailBase } from '../shared/detail_base';

@Component({
    moduleId: module.id,
    selector: 'bc-catastal',
    templateUrl: 'cat.component.html',
    styleUrls: ['cat.component.scss'],
    providers: [ShelterService]
})
export class BcCatastal extends DetailBase {
    catastal: ICatastal = {};
    drain: IDrain = { type: null };
    energy: IEnergy = {};
    constructor(shelterService: ShelterService,
        _route: ActivatedRoute,
        shared: BcSharedService,
        detailsService: BcDetailsService,
        router: Router) {
        super(_route, shared, router, detailsService, shelterService);

        shared.activeComponent = Enums.Routes.Routed_Component.catastal;
    }

    getEmptyObjData(section: any) {
        return {};
    }

    init(shelId) {
        Promise.all([
            this.getData(shelId, "catastal"),
            this.getData(shelId, "energy"),
            this.getData(shelId, "drain"),
        ])
            .then(shels => {
                const shelter = Object.assign({}, shels["0"], shels["1"], shels["2"]);
                this.drain = shelter.drain;
                this.energy = shelter.energy;
                this.catastal = shelter.catastal;
            });
    }

}
