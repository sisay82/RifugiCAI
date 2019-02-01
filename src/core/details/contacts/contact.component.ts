import {
    Component, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IContacts, IOpening } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcDetailsService } from '../details.service'
import { Enums } from '../../../app/shared/types/enums';
import { DetailBase } from '../shared/detail_base';

@Component({
    moduleId: module.id,
    selector: 'bc-contacts',
    templateUrl: 'contact.component.html',
    styleUrls: ['contact.component.scss'],
    providers: [ShelterService]
})
export class BcContact extends DetailBase {
    contacts: IContacts = { name: null, role: null };
    openings: IOpening[] = [];
    constructor(shelterService: ShelterService,
        _route: ActivatedRoute,
        shared: BcSharedService,
        router: Router,
        detailsService: BcDetailsService
    ) {
        super(_route, shared, router, detailsService, shelterService);
        shared.activeComponent = Enums.Routes.Routed_Component.contacts;
    }

    getEmptyObjData(section: any) {
        if (section === "openingTime") {
            return [];
        } else {
            return {}
        }
    }

    init(shelId) {
        Promise.all([
            this.getData(shelId, "openingTime"),
            this.getData(shelId, "contacts"),
        ])
            .then(shels => {
                const shelter = Object.assign({}, shels["0"], shels["1"]);
                this.initContacts(shelter.contacts, shelter.openingTime);
            });
    }

    initContacts(contacts: IContacts, openings: IOpening[]) {
        this.contacts = contacts;
        this.openings = openings;
    }

}
