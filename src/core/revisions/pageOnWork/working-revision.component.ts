import { Component, OnDestroy } from '@angular/core';
import { BcSharedService } from '../../../app/shared/shared.service';
import { RevisionBase } from '../shared/revision_base';
import { ActivatedRoute, Router } from '@angular/router';
import { Enums } from '../../../app/shared/types/enums';
import { BcRevisionsService } from '../revisions.service';
import { BcAuthService } from '../../../app/shared/auth.service';
import { IShelter } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';

@Component({
    moduleId: module.id,
    selector: 'bc-working-revision-page',
    templateUrl: 'working-revision.component.html',
    styleUrls: ['working-revision.component.scss'],
    providers: [ShelterService]
})
export class BcWorkingRevisionPage extends RevisionBase {

    protected initForm(shelter: IShelter) {

    }
    getEmptyObjData(section: any) {
        return {}
    }
    constructor(shared: BcSharedService,
        shelterService: ShelterService,
        router: Router,
        _route: ActivatedRoute,
        revisionService: BcRevisionsService,
        auth: BcAuthService) {
        super(shelterService, shared, revisionService, _route, router, auth);
        shared.activeComponent = Enums.Routes.Routed_Component.working;
    }

    save(confirm) { }

    checkValidForm() { return true }

    init(shelId) { }

}
