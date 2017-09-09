import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

export abstract class RevisionBase {
    protected _id:String;
    protected name:String;
    protected displayTagError:boolean=false;
    protected invalid:boolean=false;
    protected disableSave=false;
    protected maskSaveSub:Subscription;
    protected displayError:boolean=false;
    protected maskError:boolean=false;
    protected maskInvalidSub:Subscription;
    protected maskValidSub:Subscription;
    protected formValidSub:Subscription;
    protected permissionSub:Subscription;
    constructor(shelterService,shared,revisionService,authService){

        shared.onActiveOutletChange("revision");

        this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
            this.maskError=true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(()=>{
            this.maskError=false;
            if(this.checkValidForm()){
                this.displayError=false;
            }
        });

        let disableSaveSub = revisionService.childDisableSaveRequest$.subscribe(()=>{
            this.disableSave=true;
            revisionService.onChildDisableSaveAnswer();
            if(disableSaveSub!=undefined){
                disableSaveSub.unsubscribe();
            }
        });

        this.permissionSub = authService.revisionPermissions.subscribe(permissions=>{
            this.checkPermission(permissions);
        });
    }

    protected abstract checkValidForm();

    protected abstract save(confirm);

    protected abstract checkPermission(permissions);

    protected toTitleCase(input:string): string{
        if (!input) {
            return '';
        } else {
            return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1) )).replace(/_/g," ");
        }
    }
}