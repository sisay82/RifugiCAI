import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOpening, IContacts, IButton, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
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
  selector: 'bc-contacts-revision',
  templateUrl: 'contacts.component.html',
  styleUrls: ['contacts.component.scss'],
  providers:[ShelterService]
})
export class BcContactsRevision {
    _id:String;
    name:String;
    contactForm: FormGroup; 
    newOpeningForm: FormGroup;
    invalid:boolean=false;
    contacts:IContacts;
    openings:IOpening[];
    disableSave=false;
    displayError:boolean=false;
    maskSaveSub:Subscription;
    openingChange:boolean=false;
    formValidSub:Subscription;
    maskInvalidSub:Subscription;
    maskValidSub:Subscription;
    maskError:boolean=false;
    hiddenOpening:boolean=true;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.contactForm = fb.group({
            fixedPhone:["",Validators.pattern(telephoneValidator)],
            mobilePhone:["",Validators.pattern(telephoneValidator)],
            role:["",Validators.pattern(stringValidator)],
            emailAddress:["",Validators.pattern(mailValidator)],
            mailPec:["",Validators.pattern(mailValidator)],
            webAddress:["",Validators.pattern(urlValidator)],
            openings:fb.array([])
        }); 
        
        this.newOpeningForm = fb.group({
            newOpeningStartDate:["Inizio",validateDate],
            newOpeningEndDate:["Fine",validateDate],
            newOpeningType:["Tipo",[Validators.pattern(stringValidator),Validators.required]]
        });

        this.formValidSub = this.contactForm.statusChanges.subscribe((value)=>{
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
            if(this.contactForm.valid){
                this.displayError=false;
            }
        });

        let disableSaveSub = this.revisionService.childDisableSaveRequest$.subscribe(()=>{
            this.disableSave=true;
            this.revisionService.onChildDisableSaveAnswer();
            if(disableSaveSub!=undefined){
                disableSaveSub.unsubscribe();
            }
        });

        this.shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.contactForm.valid){
                if(this.openingChange||this.contactForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave("contacts");
                }
            }else{
                this.displayError=true;
            }
        });

        shared.activeComponent="contacts";
    } 

    toggleOpenings(){
        this.hiddenOpening=!this.hiddenOpening;
    }

    isHiddenOpenings(){
        return this.hiddenOpening;
    }

    getEnumOwnerNames():any[]{
        let names:any[]=[];
        const objValues = Object.keys(Enums.Owner_Type).map(k => Enums.Owner_Type[k]);
        objValues.filter(v => typeof v === "string").forEach((val)=>{
            names.push(val);
        });
        return names;
    }

    checkEnum(value){
        if(this.contactForm.controls['role'].value!=undefined){
            if(this.contactForm.controls['role'].value!=''&&this.contactForm.controls['role'].value.toLowerCase().indexOf(value.toLowerCase())>-1){
                return true;
            }
        }
        return false;
        
    }

    removeOpening(index){
        this.openingChange=true;
        const control = <FormArray>this.contactForm.controls['openings'];
        control.removeAt(index);
    }

    addNewOpening(){
        this.openingChange=true;
        if(this.newOpeningForm.controls['newOpeningStartDate'].valid&&this.newOpeningForm.controls['newOpeningEndDate'].valid&&this.newOpeningForm.controls['newOpeningType'].valid){
            let startDate;
            let endDate;
            if(this.newOpeningForm.controls['newOpeningStartDate'].value!=null&&this.newOpeningForm.controls['newOpeningStartDate'].value!=""&&
                this.newOpeningForm.controls['newOpeningEndDate'].value!=null&&this.newOpeningForm.controls['newOpeningEndDate'].value!=""){
                startDate=Date.parse(this.newOpeningForm.controls['newOpeningStartDate'].value);
                endDate=Date.parse(this.newOpeningForm.controls['newOpeningEndDate'].value);
                if(startDate<endDate){
                    this.invalid=true;
                    return;
                }
            }else{
                startDate=null;
                endDate=null;
            }
            this.invalid=false;
            const control = <FormArray>this.contactForm.controls['openings'];
            let opening:IOpening = {
                startDate:startDate,
                endDate:endDate,
                type:this.newOpeningForm.controls['newOpeningType'].value
            }
            control.push(this.initOpening(opening));
        }
    }

    initOpening(opening:IOpening){
        return this.fb.group({
            startDate:[opening.startDate?(new Date(opening.startDate).toUTCString()):null,validateDate],
            endDate:[opening.startDate?(new Date(opening.endDate).toUTCString()):null,validateDate],
            type:[opening.type,[Validators.pattern(stringValidator),Validators.required]]
        });
    }

    save(confirm){
        if(this.contactForm.valid){
            let shelter:any={_id:this._id,name:this.name};
            let wSite=null;
            if(this.contactForm.controls.webAddress.value!=null){
                wSite="http";
                if(this.contactForm.controls.webAddress.value.indexOf(wSite)==-1){
                    wSite+="://"+this.contactForm.controls.webAddress.value;
                }
            }

            let contacts:IContacts={
                fixedPhone:this.contactForm.controls.fixedPhone.value || null,
                mobilePhone:this.contactForm.controls.mobilePhone.value || null,
                role:this.contactForm.controls.role.value || null,
                emailAddress:this.contactForm.controls.emailAddress.value || null,
                mailPec:this.contactForm.controls.mailPec.value || null,
                webAddress:wSite
                
            }
            const control = <FormArray>this.contactForm.controls['openings'];
            let openings:IOpening[]=[];
            for(let c of control.controls){
                openings.push({
                    startDate:c.value.startDate?(new Date(c.value.startDate)):null,
                    endDate:c.value.endDate?(new Date(c.value.endDate)):null,
                    type:c.value.type||null
                });
            }
            shelter.openingTime=openings;
            this.revisionService.onChildSave(shelter,"openingTime");
            let openSub=this.shelterService.preventiveUpdateShelter(shelter,"openingTime").subscribe((returnVal)=>{
                if(returnVal){
                    shelter.contacts=contacts;
                    this.revisionService.onChildSave(shelter,"contacts");
                    let contSub=this.shelterService.preventiveUpdateShelter(shelter,"contacts").subscribe((returnVal)=>{
                        if(returnVal){
                            this.displayError=false;
                            if(confirm){
                                this.shared.onMaskConfirmSave("contacts");
                            }
                            //location.reload();
                        }else{
                            console.log(returnVal);
                            this.displayError=true;
                        }
                        if(contSub!=undefined){
                            contSub.unsubscribe();
                        }
                        if(openSub!=undefined){
                            openSub.unsubscribe();
                        }
                    });

                }else{
                    console.log(returnVal);
                    this.displayError=true;
                    if(openSub!=undefined){
                        openSub.unsubscribe();
                    }
                }
                
            });
        }else{
            this.displayError=true;
        }

    }

    initForm(shelter){
        this.name=shelter.name;
        this.contacts=shelter.contacts;
        this.openings=shelter.openingTime;
        if(this.contacts!=undefined){
            for(let prop in this.contacts){
                if(this.contacts.hasOwnProperty(prop)){
                    if(this.contactForm.contains(prop)){
                        this.contactForm.controls[prop].setValue(this.contacts[prop]);
                    }
                }
            }
        }
        if(this.openings!=undefined){
            const control = <FormArray>this.contactForm.controls['openings'];
            for(let opening of this.openings){
                control.push(this.initOpening(opening));
            }
        }
        
    }   

    ngOnDestroy(){
        if(this.openingChange||this.contactForm.dirty){
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

     getOpening(id):Promise<IOpening[]>{
        return new Promise<IOpening[]>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.openingTime!=undefined){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter.openingTime);
                }else{
                    let openSub=this.shelterService.getShelterSection(id,"openingTime").subscribe(shelter=>{
                        if(shelter.openingTime==undefined) shelter.openingTime=[] as [IOpening];
                        this.revisionService.onChildSave(shelter,"openingTime");
                        if(openSub!=undefined){
                            openSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        resolve(shelter.openingTime);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("openingTime");
        });
     }

     getContact(id):Promise<IContacts>{
        return new Promise<IContacts>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.contacts!=undefined){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter.contacts);
                }else{
                    let contSub=this.shelterService.getShelterSection(id,"contacts").subscribe(shelter=>{
                        if(shelter.contacts==undefined) shelter.contacts={};
                        this.revisionService.onChildSave(shelter,"contacts");
                        if(contSub!=undefined){
                            contSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        resolve(shelter.contacts);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("contacts");
        });
     }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.getContact(params["id"])
            .then((contacts)=>{
                this.getOpening(params["id"])
                .then((openings)=>{
                    let shelter={_id:params["id"],contacts:contacts,openingTime:openings};
                    this.initForm(shelter);
                    if(routeSub!=undefined){
                        routeSub.unsubscribe();
                    }
                });
            });
        });
    }
}