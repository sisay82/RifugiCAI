import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISubject, IManagement, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shelter/shelterPage/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-management-revision',
  templateUrl: 'management.component.html',
  styleUrls: ['management.component.scss'],
  providers:[ShelterService]
})
export class BcManagementRevision {
    _id:String;
    name:String;
    managForm: FormGroup; 
    data:IManagement;
    invalid:Boolean=false;
    displaySave:Boolean=false;
    displayError:boolean=false;
    activeRouteSub:Subscription;
    maskSaveSub:Subscription;

    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.managForm = fb.group({
            rent:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],//required and string
            period:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],//string with some character
            contract_start_date:[""],
            contract_end_date:[""],
            contract_duration:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],
            contract_fee:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],
            valuta:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],//number
            rentType:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            pickupKey:[""],
            subjects:fb.array([]),
            newName:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newSurname:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newTaxCode:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newFixedPhone:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newMobilePhone:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newPec:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newMail:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newWebSite:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            newType:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]
        }); 

        shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(this.managForm.dirty){
                this.save(true);
            }else{
                shared.onMaskConfirmSave(false,"management");
            }
        });

        this.activeRouteSub=shared.activeComponentRequest$.subscribe(()=>{
            shared.onActiveComponentAnswer("management");
        });
    } 

    removeSubject(index){
        const control = <FormArray>this.managForm.controls['subjects'];
        control.removeAt(index);
    }

    addNewSubject(){
        if(this.managForm.controls['newName'].valid&&
            this.managForm.controls['newSurname'].valid&&
            this.managForm.controls['newTaxCode'].valid&&
            this.managForm.controls['newFixedPhone'].valid&&
            this.managForm.controls['newMobilePhone'].valid&&
            this.managForm.controls['newPec'].valid&&
            this.managForm.controls['newMail'].valid&&
            this.managForm.controls['newWebSite'].valid&&
            this.managForm.controls['newType'].valid){
            const control = <FormArray>this.managForm.controls['tags'];
            let subject:ISubject={
                name:this.managForm.controls['newName'].value||null,
                surname:this.managForm.controls['newSurname'].value||null,
                taxCode:this.managForm.controls['newFixedPhone'].value||null,
                fixedPhone:this.managForm.controls['newFixedPhone'].value||null,
                mobilePhone:this.managForm.controls['newMobilePhone'].value||null,
                pec:this.managForm.controls['newPec'].value||null,
                email:this.managForm.controls['newMail'].value||null,
                webSite:this.managForm.controls['newWebSite'].value||null,
                type:this.managForm.controls['newType'].value||null
            }
            control.push(this.initSubject(subject));
        }
    }

    initSubject(subject:ISubject){
        return this.fb.group({
            name:[subject.name,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            surname:[subject.surname,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            taxCode:[subject.taxCode,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            fixedPhone:[subject.fixedPhone,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            mobilePhone:[subject.mobilePhone,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            pec:[subject.pec,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            email:[subject.email,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            webSite:[subject.webSite,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            type:[subject.type,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]
        });
    }

    save(confirm){
        let shelter:IShelter={_id:this._id,name:this.name};
        let management:IManagement={
            rent:this.managForm.controls["rent"].value||null,
            period:this.managForm.controls["period"].value||null,
            contract_start_date:this.managForm.controls["contract_start_date"].value||null,
            contract_end_date:this.managForm.controls["contract_end_date"].value||null,
            contract_duration:this.managForm.controls["contract_duration"].value||null,
            contract_fee:this.managForm.controls["contract_fee"].value||null,
            valuta:this.managForm.controls["valuta"].value||null,
            rentType:this.managForm.controls["rentType"].value||null,
            pickupKey:this.managForm.controls["pickupKey"].value||null
        };

        const control = <FormArray>this.managForm.controls['subjects'];
        let subjects:any=[];
        for(let c of control.controls){
            subjects.push({
                name:c.value.name||null,
                surname:c.value.name||null,
                taxCode:c.value.name||null,
                fixedPhone:c.value.name||null,
                mobilePhone:c.value.name||null,
                pec:c.value.name||null,
                email:c.value.name||null,
                webSite:c.value.name||null,
                type:c.value.name||null

            });
        }
        shelter.management=management
        shelter.management.subject=subjects;
        this.revisionService.onChildSave(shelter,"management");
        let managSub=this.shelterService.preventiveUpdateShelter(shelter,"management").subscribe((returnVal)=>{
            if(returnVal){
                this.displaySave=true;
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave(true,"management");
                }
                //location.reload();
            }else{
                console.log("Err "+returnVal);
                this.displayError=true;
                this.displaySave=false;
            }
            if(managSub!=undefined){
                managSub.unsubscribe();
            }
        });
    }

    initForm(shelter){
        this.name=shelter.name;
        this.data=shelter.geoData;

        if(this.data!=undefined){
            for(let prop in this.data){
                if(this.data.hasOwnProperty(prop)){
                    if(this.managForm.contains(prop)){
                        this.managForm.controls[prop].setValue(this.data[prop]);
                    }
                }
            }
            if(this.data.subject!=undefined){
                const control = <FormArray>this.managForm.controls['subjects'];
                for(let subj of this.data.subject){
                    control.push(this.initSubject(subj));
                }
            }
        }
    }   

    ngOnDestroy(){
        if(this.managForm.dirty){
            this.save(false);
        }
        if(this.activeRouteSub!=undefined){
            this.activeRouteSub.unsubscribe();
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
    }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.geoData!=undefined){
                    this.initForm(shelter);
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    if(routeSub!=undefined){
                        routeSub.unsubscribe();
                    }
                }else{
                    let managSub=this.shelterService.getShelterSection(params['id'],"management").subscribe(shelter=>{
                        this.initForm(shelter);
                        if(managSub!=undefined){
                            managSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        if(routeSub!=undefined){
                            routeSub.unsubscribe();
                        }
                    });
                }
                
            });
            
            this.revisionService.onChildLoadRequest("management");
        });

    }
}