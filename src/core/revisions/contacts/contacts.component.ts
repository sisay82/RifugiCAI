import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOpening, IContacts, IButton, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shelter/shelterPage/shared.service';
import { Subscription } from 'rxjs/Subscription';

let stringValidator=/^([A-Za-z0-99À-ÿ ,.:/;!?|)(_-]*)*$/;
let telephoneValidator=/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
let mailValidator=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let numberValidator=/^[0-9]+[.]{0,1}[0-9]*$/;
let urlValidator=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

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
    invalid:boolean=false;
    contacts:IContacts;
    openings:IOpening[];
    displayError:boolean=false;
    maskSaveSub:Subscription;
    activeComponentSub:Subscription;
    openingChange:boolean=false;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.contactForm = fb.group({
            fixedPhone:["",Validators.pattern(telephoneValidator)],
            mobilePhone:["",Validators.pattern(telephoneValidator)],
            role:["",Validators.pattern(stringValidator)],
            emailAddress:["",Validators.pattern(mailValidator)],
            mailPec:["",Validators.pattern(mailValidator)],
            webAddress:["",Validators.pattern(urlValidator)],
            openings:fb.array([]),
            newOpeningStartDate:["Inizio",validateDate],
            newOpeningEndDate:["Fine",validateDate],
            newOpeningType:["Tipo",Validators.pattern(stringValidator)]
        }); 

        this.shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(this.openingChange||this.contactForm.dirty){
                this.save(true);
            }else{
                shared.onMaskConfirmSave(false,"contacts");
            }
        });

        this.activeComponentSub=shared.activeComponentRequest$.subscribe(()=>{
            this.shared.onActiveComponentAnswer("contacts");
        });
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
        if(this.contactForm.controls['newOpeningStartDate'].valid&&this.contactForm.controls['newOpeningEndDate'].valid&&this.contactForm.controls['newOpeningType'].valid){
            let startDate;
            let endDate;
            if(this.contactForm.controls['newOpeningStartDate'].value!=null&&this.contactForm.controls['newOpeningStartDate'].value!=""&&
                this.contactForm.controls['newOpeningEndDate'].value!=null&&this.contactForm.controls['newOpeningEndDate'].value!=""){
                startDate=Date.parse(this.contactForm.controls['newOpeningStartDate'].value);
                endDate=Date.parse(this.contactForm.controls['newOpeningEndDate'].value);
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
                type:this.contactForm.controls['newOpeningType'].value
            }
            control.push(this.initOpening(opening));
        }
    }

    initOpening(opening:IOpening){
        this.openingChange=true;
        return this.fb.group({
            startDate:[opening.startDate?(new Date(opening.startDate).toUTCString()):null,validateDate],
            endDate:[opening.startDate?(new Date(opening.endDate).toUTCString()):null,validateDate],
            type:[opening.type,Validators.pattern(stringValidator)]
        });
    }

    save(confirm){
        let shelter:any={_id:this._id,name:this.name};
        let contacts:IContacts={
            fixedPhone:this.contactForm.controls.fixedPhone.value || null,
            mobilePhone:this.contactForm.controls.mobilePhone.value || null,
            role:this.contactForm.controls.role.value || null,
            emailAddress:this.contactForm.controls.emailAddress.value || null,
            mailPec:this.contactForm.controls.mailPec.value || null,
            webAddress:this.contactForm.controls.webAddress.value || null
            
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
                            this.shared.onMaskConfirmSave(true,"contacts");
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
            this.save(false);
        }
        if(this.activeComponentSub!=undefined){
            this.activeComponentSub.unsubscribe();
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
    }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.contacts!=undefined){
                    this.initForm(shelter);
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    if(routeSub!=undefined){
                        routeSub.unsubscribe();
                    }
                }else{
                    let openSub=this.shelterService.getShelterSection(params['id'],"openingTime").subscribe(shelterOpenings=>{
                        let contSub=this.shelterService.getShelterSection(params['id'],"contacts").subscribe(shelter=>{
                            shelter.openingTime=shelterOpenings.openingTime;
                            this.initForm(shelter);
                            if(contSub!=undefined){
                                contSub.unsubscribe();
                            }
                            if(openSub!=undefined){
                                openSub.unsubscribe();
                            }
                            if(revSub!=undefined){
                                revSub.unsubscribe();
                            }
                            if(routeSub!=undefined){
                                routeSub.unsubscribe();
                            }
                        });
                    });
                }
            });
            this.revisionService.onChildLoadRequest("contacts");
        });
    }
}