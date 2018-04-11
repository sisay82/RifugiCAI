import {
    Component, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IContacts, IOpening } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
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

    /*gotoSite(webSite: string) {
        this.redirect(webSite);
    }

    getOpening(id): Promise<IOpening[]> {
        return new Promise<IOpening[]>((resolve, reject) => {
            let revSub = this.detailsService.load$.subscribe(shelter => {
                if (shelter != null && shelter.openingTime != undefined) {
                    if (revSub != undefined) {
                        revSub.unsubscribe();
                    }
                    resolve(shelter.openingTime);
                } else {
                    let openSub = this.shelterService.getShelterSection(id, "openingTime").subscribe(shelter => {
                        if (shelter.openingTime == undefined) shelter.openingTime = [] as [IOpening];
                        this.detailsService.onChildSave(shelter, "openingTime");
                        if (openSub != undefined) {
                            openSub.unsubscribe();
                        }
                        if (revSub != undefined) {
                            revSub.unsubscribe();
                        }
                        resolve(shelter.openingTime);
                    });
                }
            });
            this.detailsService.onChildLoadRequest("openingTime");
        });
    }

    getContact(id): Promise<IContacts> {
        return new Promise<IContacts>((resolve, reject) => {
            let revSub = this.detailsService.load$.subscribe(shelter => {
                if (shelter != null && shelter.contacts != undefined) {
                    if (revSub != undefined) {
                        revSub.unsubscribe();
                    }
                    resolve(shelter.contacts);
                } else {
                    let contSub = this.shelterService.getShelterSection(id, "contacts").subscribe(shelter => {
                        if (shelter.contacts == undefined) shelter.contacts = {};
                        this.detailsService.onChildSave(shelter, "contacts");
                        if (contSub != undefined) {
                            contSub.unsubscribe();
                        }
                        if (revSub != undefined) {
                            revSub.unsubscribe();
                        }
                        resolve(shelter.contacts);
                    });
                }
            });
            this.detailsService.onChildLoadRequest("contacts");
        });
    }*/

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

    /*init(shelId) {
        this.getContact(shelId)
            .then((contacts) => {
                this.getOpening(shelId)
                    .then((openings) => {
                        this.initContacts(contacts, openings);

                    });
            });
    }*/

}
