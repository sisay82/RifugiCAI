import { Component } from '@angular/core';
import { BcSharedService } from '../../../app/shared/shared.service'
import { Enums } from '../../../app/shared/types/enums';
import { DetailBase } from '../shared/detail_base';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'bc-working-detail-page',
    templateUrl: 'working-detail.component.html',
    styleUrls: ['working-detail.component.scss']
})
export class BcWorkingDetailPage extends DetailBase{
    constructor(shared:BcSharedService,router:Router,_route:ActivatedRoute){
        super(_route,shared,router);
        shared.activeComponent=Enums.Routes.Routed_Component.working;
    }
    init(shelId){}
}