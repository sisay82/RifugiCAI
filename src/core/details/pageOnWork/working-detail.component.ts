import { Component } from '@angular/core';
import { BcSharedService } from '../../../app/shared/shared.service'
@Component({
    moduleId: module.id,
    selector: 'bc-working-detail-page',
    templateUrl: 'working-detail.component.html',
    styleUrls: ['working-detail.component.scss']
})
export class BcWorkingDetailPage {
    constructor(private shared:BcSharedService){
        shared.activeComponent="working";
        this.shared.onActiveOutletChange("content");
    }

}