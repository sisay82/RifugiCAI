import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOpening, IContacts, IButton, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';

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
    displaySave:Boolean=false;
    displayError:boolean=false;

    constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.contactForm = fb.group({
            fixedPhone:["",Validators.pattern(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)],
            mobilePhone:["",Validators.pattern(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)],
            role:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            emailAddress:["",Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)],
            mailPec:["",Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)],
            webAddress:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            openings:fb.array([]),
            newOpeningStartDate:["Inizio",validateDate],
            newOpeningEndDate:["Fine",validateDate],
            newOpeningType:["Tipo",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)]
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
        const control = <FormArray>this.contactForm.controls['openings'];
        control.removeAt(index);
    }

    addNewOpening(){
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
        return this.fb.group({
            startDate:[opening.startDate?(new Date(opening.startDate).toUTCString()):null,validateDate],
            endDate:[opening.startDate?(new Date(opening.endDate).toUTCString()):null,validateDate],
            type:[opening.type,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)]
        });
    }

    click(ref:any){
        let shelter:any={_id:ref._id,name:ref.name};
        let contacts:IContacts={
            fixedPhone:ref.contactForm.controls.fixedPhone.value || null,
            mobilePhone:ref.contactForm.controls.mobilePhone.value || null,
            role:ref.contactForm.controls.role.value || null,
            emailAddress:ref.contactForm.controls.emailAddress.value || null,
            mailPec:ref.contactForm.controls.mailPec.value || null,
            webAddress:ref.contactForm.controls.webAddress.value || null
            
        }
        const control = <FormArray>ref.contactForm.controls['openings'];
        let openings:IOpening[]=[];
        for(let c of control.controls){
            openings.push({
                startDate:c.value.startDate?(new Date(c.value.startDate)):null,
                endDate:c.value.endDate?(new Date(c.value.endDate)):null,
                type:c.value.type||null
            });
        }
        shelter.openingTime=openings;
        ref.revisionService.onChildSave(shelter,"openingTime");
        ref.shelterService.preventiveUpdateShelter(shelter,"openingTime").subscribe((returnVal)=>{
            if(returnVal){
                ref.displaySave=true;
                ref.displayError=false;
                //location.reload();
            }else{
                console.log(returnVal);
                ref.displayError=true;
                ref.displaySave=false;
            }
        });
        shelter.contacts=contacts;
        ref.revisionService.onChildSave(shelter,"contacts");
        ref.shelterService.preventiveUpdateShelter(shelter,"contacts").subscribe((returnVal)=>{
            if(returnVal){
                ref.displaySave=true;
                ref.displayError=false;
                //location.reload();
            }else{
                console.log(returnVal);
                ref.displayError=true;
                ref.displaySave=false;
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
        if(this.contactForm.dirty){
            this.click(this);
        }
    }

    ngOnInit(){
        this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.contacts!=undefined){
                    this.initForm(shelter);
                }else{
                    this.shelterService.getShelterSection(params['id'],"openingTime").subscribe(shelterOpenings=>{
                        this.shelterService.getShelterSection(params['id'],"contacts").subscribe(shelter=>{
                            shelter.openingTime=shelterOpenings.openingTime;
                            this.initForm(shelter);
                        });
                    });
                }
            });
            this.revisionService.onChildLoadRequest("contacts");
        });

    }
}