import {
    Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {RevisionBase} from '../shared/revision_base';
@Component({
    moduleId: module.id,
    selector: 'bc-fruition-revision',
    templateUrl: 'fruition.component.html',
    styleUrls: ['fruition.component.scss'],
    providers:[ShelterService]
})
export class BcFruitionRevision extends RevisionBase {

    constructor(private shelterService:ShelterService,private shared:BcSharedService,private revisionService:BcRevisionsService){
        super(shelterService,shared,revisionService);
        shared.activeComponent="fruition";
        shared.onActiveOutletChange("revision");
    }
    
    save(confirm){
        return true;
    }

    checkValidForm(){
        return true;
    }
}