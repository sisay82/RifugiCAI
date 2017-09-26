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
    selector: 'bc-economy-revision',
    templateUrl: 'economy.component.html',
    styleUrls: ['economy.component.scss'],
    providers:[ShelterService]
})
export class BcEconomyRevision extends RevisionBase {


    
    save(confirm){
        return true;
    }

    checkValidForm(){
        return true;
    }
}