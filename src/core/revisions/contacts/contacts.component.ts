import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOpening, IContacts, IButton, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { parseDate } from '../../inputs/text/text_input.component';
import {BcAuthService} from '../../../app/shared/auth.service';

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
    permissionSub:Subscription;    
    hiddenOpening:boolean=true;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private authService:BcAuthService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
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
            newOpeningStartDate:["Inizio"],
            newOpeningEndDate:["Fine"],
            newOpeningType:["Tipo"]
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

        this.permissionSub = authService.revisionPermissions.subscribe(permissions=>{
            this.checkPermission(permissions);
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
                shared.onDisplayError();
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
                if(startDate>endDate){
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
            this.resetOpeningForm();
        }else{
            this.invalid=true;
        }
    }

    resetOpeningForm(){
        this.newOpeningForm = this.fb.group({
            newOpeningStartDate:["Inizio"],
            newOpeningEndDate:["Fine"],
            newOpeningType:["Tipo"]
        });
        this.toggleOpenings();
    }

    initOpening(opening:IOpening){
        return this.fb.group({
            startDate:[opening.startDate?(new Date(opening.startDate).toLocaleDateString()||null):null],
            endDate:[opening.endDate?(new Date(opening.endDate).toLocaleDateString()||null):null],
            type:[opening.type]
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
        if(this.contactForm.valid){
            let shelter:any={_id:this._id,name:this.name};

            let contacts:IContacts={
                fixedPhone:this.contactForm.controls.fixedPhone.value || null,
                mobilePhone:this.contactForm.controls.mobilePhone.value || null,
                role:this.contactForm.controls.role.value || null,
                emailAddress:this.contactForm.controls.emailAddress.value || null,
                prenotation_link:this.processUrl(this.contactForm.controls.prenotation_link.value),
                webAddress:this.processUrl(this.contactForm.controls.webAddress.value)
            }
            const control = <FormArray>this.contactForm.controls['openings'];
            let openings:IOpening[]=[];
            for(let c of control.controls){
                openings.push({
                    startDate:c.value.startDate?(parseDate(c.value.startDate)||null):null,
                    endDate:c.value.endDate?(parseDate(c.value.endDate)||null):null,
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
        if(this.permissionSub!=undefined){
            this.permissionSub.unsubscribe();
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

    initialize(){
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

    ngOnInit() {
        let permissions = this.revisionService.getLocalPermissions();
        if(permissions!=undefined){
            this.checkPermission(permissions);
        }        
    }

    checkPermission(permissions){
        if(permissions.length>0){
            if(permissions.find(obj=>obj==Enums.MenuSection.detail)>-1){
                this.revisionService.updateLocalPermissions(permissions);
                this.initialize();
            }else{
                location.href="/list";
            }
        }
    }
}