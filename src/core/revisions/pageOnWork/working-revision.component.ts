import { Component,OnDestroy } from '@angular/core';
import { BcSharedService } from '../../../app/shared/shared.service';

@Component({
    moduleId: module.id,
    selector: 'bc-working-revision-page',
    templateUrl: 'working-revision.component.html',
    styleUrls: ['working-revision.component.scss'],
})
export class BcWorkingRevisionPage {
   
    constructor(private shared:BcSharedService){
        shared.activeComponent="working";
        shared.onActiveOutletChange("revision");
    }

}