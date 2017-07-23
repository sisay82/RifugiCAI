import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Enums } from '../../../app/shared/types/enums';
import { ISubject, IManagement, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

let stringValidator=/^([A-Za-z0-99À-ÿ� ,.:/';!?|)(_-]*)*$/;
let telephoneValidator=/^([0-9]*)*$/;
let mailValidator=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let numberValidator=/^[0-9]+[.]{0,1}[0-9]*$/;
let urlValidator=/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

function validateDate(c:FormControl){
    if(c.value!=''&&c.value!=null){
        let date = Date.parse(c.value);
        if(!isNaN(date)){
            return null;
        }else{
            return {valid:false};
        }
    }
    return null;
}


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
            rent:["",Validators.pattern(numberValidator)],
            period:["",Validators.pattern(stringValidator)],//string with some character
            contract_start_date:["",validateDate],
            contract_end_date:["",validateDate],
            contract_duration:["",Validators.pattern(numberValidator)],
            contract_fee:["",Validators.pattern(numberValidator)],
            valuta:["",Validators.pattern(stringValidator)],
            rentType:["",Validators.pattern(stringValidator)],
            pickupKey:[""],
            subjects:fb.array([]),
            propName:["",Validators.pattern(stringValidator)],
            propTaxCode:["",Validators.pattern(stringValidator)],
            propFixedPhone:["",Validators.pattern(telephoneValidator)],
            propPec:["",Validators.pattern(mailValidator)],
            propEmail:["",Validators.pattern(mailValidator)],
        }); 

        this.newSubjectForm = fb.group({
            newName:["",Validators.pattern(stringValidator)],
            newSurname:["",Validators.pattern(stringValidator)],
            newTaxCode:["",Validators.pattern(stringValidator)],
            newFixedPhone:["",Validators.pattern(telephoneValidator)],
            newMobilePhone:["",Validators.pattern(telephoneValidator)],
            newPec:["",Validators.pattern(stringValidator)],
            newMail:["",Validators.pattern(stringValidator)],
            newWebSite:["",Validators.pattern(urlValidator)],
            newType:["",Validators.pattern(stringValidator)]
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
                taxCode:this.newSubjectForm.controls['newFixedPhone'].value||null,
                fixedPhone:this.newSubjectForm.controls['newFixedPhone'].value||null,
                mobilePhone:this.newSubjectForm.controls['newMobilePhone'].value||null,
                pec:this.newSubjectForm.controls['newPec'].value||null,
                email:this.newSubjectForm.controls['newMail'].value||null,
                webSite:this.newSubjectForm.controls['newWebSite'].value||null,
                type:this.newSubjectForm.controls['newType'].value||null
            }
            control.push(this.initSubject(subject));
        }
    }

    getEnumCustodyNames():any[]{
        let names:any[]=[];
        const objValues = Object.keys(Enums.Custody_Type).map(k => Enums.Custody_Type[k]);
        objValues.filter(v => typeof v === "string").forEach((val)=>{
            names.push(val);
        });
        return names;
    }

    checkEnum(value){
        if(this.managForm.controls['rentType'].value!=undefined){
            if(this.managForm.controls['rentType'].value!=''&&this.managForm.controls['rentType'].value.toLowerCase().indexOf(value.toLowerCase())>-1){
                return true;
            }
        }
        return false;
    }

    initSubject(subject:ISubject){
        return this.fb.group({
            name:[subject.name,Validators.pattern(stringValidator)],
            surname:[subject.surname,Validators.pattern(stringValidator)],
            taxCode:[subject.taxCode,Validators.pattern(stringValidator)],
            fixedPhone:[subject.fixedPhone,Validators.pattern(telephoneValidator)],
            mobilePhone:[subject.mobilePhone,Validators.pattern(telephoneValidator)],
            pec:[subject.pec,Validators.pattern(mailValidator)],
            email:[subject.email,Validators.pattern(mailValidator)],
            webSite:[subject.webSite,Validators.pattern(urlValidator)],
            type:[subject.type,Validators.pattern(stringValidator)]
        });
    }

    save(confirm){
        if(this.managForm.valid){
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

            let prop:ISubject={
                name:this.managForm.controls["propName"].value||null,
                taxCode:this.managForm.controls["propTaxCode"].value||null,
                fixedPhone:this.managForm.controls["propFixedPhone"].value||null,
                pec:this.managForm.controls["propPec"].value||null,
                email:this.managForm.controls["propEmail"].value||null,
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
                    webSite:c.value.webSite||null,
                    type:c.value.type||null
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

    initForm(shelter){
        this.name=shelter.name;
        this.data=shelter.management;

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
                    if(subj.type!=undefined&&subj.type.toLowerCase().indexOf("proprietario")>-1){
                        this.property=subj;
                        this.managForm.controls["propName"].setValue(subj.name);
                        this.managForm.controls["propTaxCode"].setValue(subj.taxCode);
                        this.managForm.controls["propFixedPhone"].setValue(subj.fixedPhone);
                        this.managForm.controls["propPec"].setValue(subj.pec);
                        this.managForm.controls["propEmail"].setValue(subj.email);
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