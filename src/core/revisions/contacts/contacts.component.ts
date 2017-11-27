import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IOpening, IContacts, IButton, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { trimYear, parseDate } from '../../inputs/text/text_input.component';
import {RevisionBase} from '../shared/revision_base';

@Component({
  moduleId: module.id,
  selector: 'bc-contacts-revision',
  templateUrl: 'contacts.component.html',
  styleUrls: ['contacts.component.scss'],
  providers:[ShelterService]
})
export class BcContactsRevision extends RevisionBase {
    contactForm: FormGroup; 
    newOpeningForm: FormGroup;
    contacts:IContacts;
    openings:IOpening[];
    openingChange:boolean=false;
    hiddenOpening:boolean=true;
    constructor(shared:BcSharedService,shelterService:ShelterService,_route:ActivatedRoute,router:Router,private fb: FormBuilder,revisionService:BcRevisionsService) { 
    super(shelterService,shared,revisionService,_route,router);
    this.contactForm = fb.group({
            fixedPhone:[""],
            mobilePhone:[""],
            role:[""],
            emailAddress:[""],
            prenotation_link:[""],
            webAddress:[""],
            openings:fb.array([])
        }); 
        
        this.newOpeningForm = fb.group({
            newOpeningStartDate:[""],
            newOpeningEndDate:[""],
            newOpeningType:[""]
        });

        this.formValidSub = this.contactForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(!this.maskError){
                    this.displayError=false;
                }
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.contactForm.valid){
                if(this.openingChange||this.contactForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave(Enums.Routed_Component.contacts);
                }
            }else{
                this.abortSave();
            }
        });

        shared.activeComponent=Enums.Routed_Component.contacts;
    } 

    getFormControls(controlName){
        return (<FormGroup>this.contactForm.controls[controlName]).controls;
    }

    checkValidForm(){
        return this.contactForm.valid;
    }

    toggleOpenings(){
        this.hiddenOpening=!this.hiddenOpening;
    }

    isHiddenOpenings(){
        return this.hiddenOpening;
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
                startDate=parseDate(this.newOpeningForm.controls['newOpeningStartDate'].value);
                endDate=parseDate(this.newOpeningForm.controls['newOpeningEndDate'].value);
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
            this.resetOpeningForm();
        }else{
            this.invalid=true;
        }
    }

    resetOpeningForm(){
        this.newOpeningForm = this.fb.group({
            newOpeningStartDate:[""],
            newOpeningEndDate:[""],
            newOpeningType:[""]
        });
        this.toggleOpenings();
    }

    initOpening(opening:IOpening){
        return this.fb.group({
            startDate:[trimYear(opening.startDate)],
            endDate:[trimYear(opening.endDate)],
            type:[opening.type]
        });
    }

    save(confirm){
        if(!confirm||this.contactForm.valid){
            let shelter:any={_id:this._id,name:this.name};

            const contacts:IContacts={
                fixedPhone:this.getControlValue(<FormGroup>this.contactForm.controls.fixedPhone),
                mobilePhone:this.getControlValue(<FormGroup>this.contactForm.controls.mobilePhone),
                role:this.getControlValue(<FormGroup>this.contactForm.controls.role),
                emailAddress:this.getControlValue(<FormGroup>this.contactForm.controls.emailAddress),
                prenotation_link:this.processUrl(<FormGroup>this.contactForm.controls.prenotation_link),
                webAddress:this.processUrl(<FormGroup>this.contactForm.controls.webAddress)
            }

            
            const op=this.getFormArrayValues(<FormArray>this.contactForm.controls.openings);
            const openings = op.map(val=>{
                if(val){
                    if(val.startDate){
                        val.startDate=this.processSimpleDate(val.startDate);
                    }
                    if(val.endDate){
                        val.endDate=this.processSimpleDate(val.endDate);
                    }
                }
                return val;
            });

            shelter.openingTime=openings;
            shelter.contacts=contacts;
            this.processSavePromise(shelter,"openingTime")
            .then(()=>this.processSavePromise(shelter,"contacts"))
            .then(()=>{
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave(Enums.Routed_Component.contacts);
                }
            })
            .catch((err)=>{
                this.abortSave();
                console.log(err);
            });
        }else{
            this.abortSave();
        }

    }

    initForm(shelter){
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
                    this.name=shelter.name;
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter.openingTime);
                }else{
                    let openSub=this.shelterService.getShelterSection(id,"openingTime").subscribe(shelter=>{
                        if(shelter.openingTime==undefined) shelter.openingTime=[] as [IOpening];
                        this.name=shelter.name;
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
                    this.name=shelter.name;
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter.contacts);
                }else{
                    let contSub=this.shelterService.getShelterSection(id,"contacts").subscribe(shelter=>{
                        if(shelter.contacts==undefined) shelter.contacts={};
                        this.name=shelter.name;
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

    init(shelId){
        this.getContact(shelId)
        .then((contacts)=>{
            this.getOpening(shelId)
            .then((openings)=>{
                let shelter={_id:shelId,contacts:contacts,openingTime:openings};
                this.initForm(shelter);
            });
        });
    }
}