import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Enums } from '../../../app/shared/types/enums';
import { ISubject, IManagement, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { parseDate } from '../../inputs/text/text_input.component';

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
    newSubjectForm: FormGroup;
    data:IManagement;
    property:ISubject;
    invalid:Boolean=false;
    displayError:boolean=false;
    disableSave=false;
    maskSaveSub:Subscription;
    subjectChange:boolean=false;
    maskInvalidSub:Subscription;
    maskValidSub:Subscription;
    maskError:boolean=false;
    hiddenSubject:boolean=true;
    formValidSub:Subscription;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.managForm = fb.group({
            rentType:[""],
            valuta:[""],
            reference:[""],
            pickupKey:[""],
            self_management:[""],
            subjects:fb.array([]),
            propName:[""],
            propTaxCode:[""],
            propFixedPhone:[""],
            propPec:[""],
            propEmail:[""],
            propWebSite:[""],
            propContract_start_date:[""],
            propContract_end_date:[""],
            propContract_duration:[""],
            propContract_fee:[""],
            propPossessionType:[""]
        }); 

        this.newSubjectForm = fb.group({
            newName:[""],
            newSurname:[""],
            newTaxCode:[""],
            newFixedPhone:[""],
            newMobilePhone:[""],
            newPec:[""],
            newMail:[""],
            newWebSite:[""],
            newType:[""],
            newContract_start_date:[""],
            newContract_end_date:[""],
            newContract_duration:[""],
            newContract_fee:[""],
            newPossessionType:[""]
        });

        shared.onActiveOutletChange("revision");

        this.formValidSub = this.managForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(!this.maskError){
                    this.displayError=false;
                }
            }
        });

        this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
            this.maskError=true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(()=>{
            this.maskError=false;
            if(this.managForm.valid){
                this.displayError=false;
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.managForm.valid){
                if(this.subjectChange||this.managForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave("management");
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });

        let disableSaveSub = this.revisionService.childDisableSaveRequest$.subscribe(()=>{
            this.disableSave=true;
            this.revisionService.onChildDisableSaveAnswer();
            if(disableSaveSub!=undefined){
                disableSaveSub.unsubscribe();
            }
        });

        shared.activeComponent="management";
    } 


    isHiddenSubject(){
        return this.hiddenSubject;
    }

    toggleSubject(){
        this.hiddenSubject=!this.hiddenSubject;
    }

    removeSubject(index){
        this.subjectChange=true;
        const control = <FormArray>this.managForm.controls['subjects'];
        control.removeAt(index);
    }

    addNewSubject(){
        this.subjectChange=true;
        if(this.newSubjectForm.valid){
            const control = <FormArray>this.managForm.controls['subjects'];
            let subject:ISubject={
                name:this.newSubjectForm.controls['newName'].value||null,
                surname:this.newSubjectForm.controls['newSurname'].value||null,
                taxCode:this.newSubjectForm.controls['newTaxCode'].value||null,
                fixedPhone:this.newSubjectForm.controls['newFixedPhone'].value||null,
                mobilePhone:this.newSubjectForm.controls['newMobilePhone'].value||null,
                pec:this.newSubjectForm.controls['newPec'].value||null,
                email:this.newSubjectForm.controls['newMail'].value||null,
                webSite:this.newSubjectForm.controls['newWebSite'].value||null,
                type:this.newSubjectForm.controls['newType'].value||null,
                contract_start_date:this.newSubjectForm.controls["newContract_start_date"].value?(parseDate(this.newSubjectForm.controls["newContract_start_date"].value)||null):null,
                contract_end_date: this.newSubjectForm.controls["newContract_end_date"].value?(parseDate(this.newSubjectForm.controls["newContract_end_date"].value)||null):null,
                contract_duration:this.newSubjectForm.controls["newContract_duration"].value||null,
                contract_fee:this.newSubjectForm.controls["newContract_fee"].value||null,
                possession_type:this.newSubjectForm.controls["newPossessionType"].value||null,
            }
            control.push(this.initSubject(subject));
            this.resetSubjectForm();
        }else{
            this.invalid=true;
        }
    }

    resetSubjectForm(){
        this.newSubjectForm = this.fb.group({
            newName:[""],
            newSurname:[""],
            newTaxCode:[""],
            newFixedPhone:[""],
            newMobilePhone:[""],
            newPec:[""],
            newMail:[""],
            newWebSite:[""],
            newType:[""],
            newContract_start_date:[""],
            newContract_end_date:[""],
            newContract_duration:[""],
            newContract_fee:[""],
            newPossessionType:[""]
        });
        this.toggleSubject();
    }

    initSubject(subject:ISubject){
        return this.fb.group({
            name:[subject.name],
            surname:[subject.surname],
            taxCode:[subject.taxCode],
            fixedPhone:[subject.fixedPhone],
            mobilePhone:[subject.mobilePhone],
            pec:[subject.pec],
            email:[subject.email],
            webSite:[subject.webSite],
            type:[subject.type],
            contract_start_date:[subject.contract_start_date?(new Date(subject.contract_start_date).toLocaleDateString()):null],
            contract_end_date:[subject.contract_end_date?(new Date(subject.contract_end_date).toLocaleDateString()):null],
            contract_duration:[subject.contract_duration],
            contract_fee:[subject.contract_fee],
            possession_type:[subject.possession_type]
        });
    }

    processUrl(value){
        if(value!=null&&value!=""){
            let wSite="http";
            if(value.toLowerCase().indexOf("://")==-1){
                wSite+="://"+value;
            }else{
                wSite=value;
            }
            
            return wSite;
        }else{
            return null;
        }
    }

    save(confirm){
        if(this.managForm.valid){
            let shelter:IShelter={_id:this._id,name:this.name};

            let management:IManagement={
                rentType:this.managForm.controls["rentType"].value||null,
                valuta:this.managForm.controls["valuta"].value||null,
                self_management:this.managForm.controls["self_management"].value||null,
                pickupKey:this.managForm.controls["pickupKey"].value||null,
                reference:this.managForm.controls["reference"].value||null
            };

            let prop:ISubject={
                name:this.managForm.controls["propName"].value||null,
                taxCode:this.managForm.controls["propTaxCode"].value||null,
                fixedPhone:this.managForm.controls["propFixedPhone"].value||null,
                pec:this.managForm.controls["propPec"].value||null,
                email:this.managForm.controls["propEmail"].value||null,
                contract_start_date:this.managForm.controls["propContract_start_date"].value?(parseDate(this.managForm.controls["propContract_start_date"].value)||null):null,
                contract_end_date: this.managForm.controls["propContract_end_date"].value?(parseDate(this.managForm.controls["propContract_end_date"].value)||null):null,
                contract_duration:this.managForm.controls["propContract_duration"].value||null,
                contract_fee:this.managForm.controls["propContract_fee"].value||null,
                possession_type:this.managForm.controls["propPossessionType"].value||null,
                webSite:this.processUrl(this.managForm.controls.propWebSite.value),
                type:"Proprietario"
            }

            const control = <FormArray>this.managForm.controls['subjects'];
            let subjects:ISubject[]=[];
            subjects.push(prop);
            for(let c of control.controls){         
                subjects.push({
                    name:c.value.name||null,
                    surname:c.value.surname||null,
                    taxCode:c.value.taxCode||null,
                    fixedPhone:c.value.fixedPhone||null,
                    mobilePhone:c.value.mobilePhone||null,
                    pec:c.value.pec||null,
                    email:c.value.email||null,
                    webSite:this.processUrl(c.value.webSite),
                    type:c.value.type||null,
                    contract_start_date:c.value.contract_start_date,
                    contract_end_date: c.value.contract_end_date,
                    contract_duration:c.value.contract_duration,
                    contract_fee:c.value.contract_fee,
                    possession_type:c.value.possession_type
                });
            }
            shelter.management=management
            shelter.management.subject=subjects as [ISubject];
            this.revisionService.onChildSave(shelter,"management");
        
            let managSub=this.shelterService.preventiveUpdateShelter(shelter,"management").subscribe((returnVal)=>{
                if(returnVal){
                    this.displayError=false;
                    if(confirm){
                        this.shared.onMaskConfirmSave("management");
                    }
                }else{
                    console.log("Err "+returnVal);
                    this.displayError=true;
                }
                if(managSub!=undefined){
                    managSub.unsubscribe();
                }
            });
        }else{
            this.displayError=true;
        }
    }

    initDate(value){

    }

    initForm(shelter){
        this.name=shelter.name;
        this.data=shelter.management;

        if(this.data!=undefined){
            for(let prop in this.data){
                if(this.data.hasOwnProperty(prop)){
                    if(this.managForm.contains(prop)){
                        if(prop.indexOf("date")==-1){
                            this.managForm.controls[prop].setValue(this.data[prop]);
                        }else{
                            this.managForm.controls[prop].setValue(this.data[prop]?(new Date(this.data[prop]).toLocaleDateString()||null):null);
                        }
                    }
                }
            }
            if(this.data.subject!=undefined){
                const control = <FormArray>this.managForm.controls['subjects'];
                for(let subj of this.data.subject){
                    if(subj.type!=undefined&&subj.type.toLowerCase().indexOf("proprietario")>-1){
                        this.property=subj;
                        this.managForm.controls["propName"].setValue(subj.name);
                        this.managForm.controls["propTaxCode"].setValue(subj.taxCode);
                        this.managForm.controls["propFixedPhone"].setValue(subj.fixedPhone);
                        this.managForm.controls["propPec"].setValue(subj.pec);
                        this.managForm.controls["propEmail"].setValue(subj.email);
                        this.managForm.controls["propWebSite"].setValue(subj.webSite);
                        this.managForm.controls["propContract_start_date"].setValue(subj.contract_start_date?(new Date(subj.contract_start_date).toLocaleDateString()):null);
                        this.managForm.controls["propContract_end_date"].setValue(subj.contract_end_date?(new Date(subj.contract_end_date).toLocaleDateString()):null);
                        this.managForm.controls["propContract_duration"].setValue(subj.contract_duration);
                        this.managForm.controls["propContract_fee"].setValue(subj.contract_fee);
                        this.managForm.controls["propPossessionType"].setValue(subj.possession_type);
                    }else{
                        control.push(this.initSubject(subj));
                    }
                }
            }
        }
    }   

    ngOnDestroy(){
        if(this.subjectChange||this.managForm.dirty){
            if(!this.disableSave)
                this.save(false);
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

    getManagement(id):Promise<IShelter>{
        return new Promise<IShelter>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.management!=undefined){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                }else{
                    let managSub=this.shelterService.getShelterSection(id,"management").subscribe(shelter=>{
                        if(shelter.management==undefined) shelter.management={subject:[] as [ISubject]};
                        this.revisionService.onChildSave(shelter,"management");
                        if(managSub!=undefined){
                            managSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        resolve(shelter);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("management");
        });
    }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.getManagement(params["id"])
            .then(shelter=>{
                this.initForm(shelter);
                if(routeSub!=undefined){
                    routeSub.unsubscribe();
                }
            });
        });

    }
}