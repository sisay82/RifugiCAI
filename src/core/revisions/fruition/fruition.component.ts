import {
    Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IShelter,IUse } from '../../../app/shared/types/interfaces'
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
    useForm: FormGroup; 
    private data:IUse;

    constructor(shelterService:ShelterService,shared:BcSharedService,revisionService:BcRevisionsService,private fb: FormBuilder,_route:ActivatedRoute,router:Router){
        super(shelterService,shared,revisionService,_route,router);
        shared.activeComponent="use";
        shared.onActiveOutletChange("revision");

        this.useForm = fb.group({
            stay_count_associate:[""],
            stay_count_reciprocity:[""],
            stay_count:[""],
            transit_count_associate:[""],
            transit_count_reciprocity:[""],
            transit_count:[""]
        }); 

        this.formValidSub = this.useForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(!this.maskError){
                    this.displayError=false;
                }
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.useForm.valid){
                if(this.useForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave("use");
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });
    }

    save(confirm){
        if(!confirm||this.useForm.valid){
            let shelter:IShelter={_id:this._id,name:this.name};
            let use:IUse=<IUse>this.getFormValues(this.useForm);
            use.year=this.data.year;
            
            shelter.use=[use];
            this.processSavePromise(shelter,"use")
            .then(()=>{
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave("use");
                }
            })
            .catch(err=>{
                this.displayError=true;
                console.log(err);
            });
        }else{
            this.displayError=true;
        }
    }

    initForm(shelter:IShelter){
        this.name=shelter.name;
        if(shelter.use){
            this.data=shelter.use.find(obj=>obj.year==(new Date()).getFullYear());
        }
        if(!this.data){
            this.data={year:(new Date()).getFullYear()};
        }
        this.useForm.controls.stay_count_associate.setValue(this.data.stay_count_associate||null);
        this.useForm.controls.stay_count_reciprocity.setValue(this.data.stay_count_reciprocity||null);
        this.useForm.controls.stay_count.setValue(this.data.stay_count||null);
        this.useForm.controls.transit_count_associate.setValue(this.data.transit_count_associate||null);
        this.useForm.controls.transit_count_reciprocity.setValue(this.data.transit_count_reciprocity||null);
        this.useForm.controls.transit_count.setValue(this.data.transit_count||null);
    }   

    ngOnDestroy(){
        if(this.useForm.dirty){
            if(!this.disableSave){
                this.save(false);
            }
                
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
        if(this.maskInvalidSub!=undefined){
            this.maskInvalidSub.unsubscribe();
        }
        if(this.maskValidSub!=undefined){
            this.maskValidSub.unsubscribe();
        }
        
    }

    getUse(id):Promise<IShelter>{
        return new Promise<IShelter>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                }else{
                    let shelSub=this.shelterService.getShelterSection(id,"use").subscribe(shelter=>{
                        this.revisionService.onChildSave(shelter,"use");
                        if(shelSub!=undefined){
                            shelSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        resolve(shelter);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("use");
        });
    }

    init(shelId){
        this.getUse(shelId)
        .then((shelter)=>{
            this.initForm(shelter);
        });
    }

    checkValidForm(){
        return true;
    }
}