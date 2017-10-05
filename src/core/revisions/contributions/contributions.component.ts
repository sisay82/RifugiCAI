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
import {BcAuthService} from '../../../app/shared/auth.service';
import { Enums } from '../../../app/shared/types/enums'

@Component({
    moduleId: module.id,
    selector: 'bc-contributions-revision',
    templateUrl: 'contributions.component.html',
    styleUrls: ['contributions.component.scss'],
    providers:[ShelterService]
})
export class BcContributionRevision extends RevisionBase {

    constructor(private shelterService:ShelterService,private authService:BcAuthService,private shared:BcSharedService,private revisionService:BcRevisionsService){
        super(shelterService,shared,revisionService,authService);
        shared.activeComponent="contributions";
        shared.onActiveOutletChange("revision");
    }
    
    checkPermission(permissions){
        if(permissions&&permissions.length>0){
            if(permissions.find(obj=>obj==Enums.MenuSection.economy)>-1){
                this.initialize();
            }else{
                location.href="/list";
            }
        }
    }

    ngOnInit() {
        let permissionSub = this.revisionService.fatherReturnPermissions$.subscribe(permissions=>{
            this.checkPermission(permissions);
            if(permissionSub!=undefined){
                permissionSub.unsubscribe();
            }
        });
        this.revisionService.onChildGetPermissions();      
    }

    initialize(){

    }

    save(confirm){
        return true;
    }

    checkValidForm(){
        return true;
    }
}