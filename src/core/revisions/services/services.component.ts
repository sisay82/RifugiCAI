import {
  Component,Input,OnInit, trigger, state, style, transition, animate//,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IButton, IShelter, IService, ITag } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-serv-revision',
  templateUrl: 'services.component.html',
  styleUrls: ['services.component.scss'],
  providers:[ShelterService],
  animations: [ Animations.slideInOut ]
})
export class BcServRevision {
    _id:String;
    name:String;
    servForm: FormGroup; 
    newServiceForm: FormGroup;
    newTagForm: FormGroup;
    serviceToRemove:String[]=[];
    serviceList:IService[]=[];
    currentServiceTag:number=-1;
    serviceHidden:boolean=true;
    displayError:boolean=false;
    maskSaveSub:Subscription;
    disableSave=false;
    newServiceAdded=false;
    newTagHidden:boolean=true;
    serviceListChange:boolean=false;
    maskInvalidSub:Subscription;
    maskValidSub:Subscription;
    maskError:boolean=false;
    formValidSub:Subscription;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.servForm = fb.group({
            services:fb.array([])
            
        }); 

        this.newServiceForm = fb.group({
            newServiceName:["Nome Nuovo Servizio"],
            newServiceDescription:["Descrizione Nuovo Servizio"],
            newServiceCategory:["Nuova categoria"],
            newServiceTags:fb.array([]),
            newServiceTagKey:["Informazione"],
            newServiceTagValue:["Valore"],
            newServiceBooleanTagValue:[false]
        });

        this.newTagForm = fb.group({
            newTagKey:["Informazione"],
            newTagValue:["Valore"],
            newBooleanTagValue:[false]
        });

        shared.onActiveOutletChange("revision");

        this.formValidSub = this.servForm.statusChanges.subscribe((value)=>{
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
            if(this.servForm.valid){
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

        shared.activeComponent="services";

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.servForm.valid){
                if(this.serviceListChange||this.servForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave("services");
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });
    } 

    toggleNewTag(){
        this.newTagHidden=!this.newTagHidden;
    }

    isNewTagHidden(){
        return this.newTagHidden;
    }

    toggleTag(serviceIndex:number): void {
        if(this.currentServiceTag==serviceIndex){
            this.currentServiceTag=-1;
        }else{
            this.currentServiceTag=serviceIndex;
        }
    }

    isHiddenTag(serviceIndex): boolean {
        return !(this.currentServiceTag==serviceIndex);
    }

    toggleNewService(): void {
        this.serviceHidden=!this.serviceHidden;
    }

    isHiddenNewService(): boolean {
        return this.serviceHidden;
    }

    removeService(serviceIndex){
        this.serviceListChange=true;
        const services=<FormArray>this.servForm.controls.services;
        if(this.serviceList[serviceIndex]!=undefined){
            let service=this.serviceList[serviceIndex];
            if(service!=undefined){
                this.serviceToRemove.push(service._id);
            }
        }
        services.removeAt(serviceIndex);
    }

    addNewService(){
        this.serviceListChange=true;
        this.newServiceAdded=true;
        
        if(this.newServiceForm.valid){
            const control=(<FormArray>this.servForm.controls.services);
            
            let service:IService={
                name:this.newServiceForm.controls.newServiceName.value||null,
                category:this.newServiceForm.controls.newServiceCategory.value,
                description:this.newServiceForm.controls.newServiceDescription.value||null
            }
            let tags:any=[];

            for(let tag of (<FormArray>this.newServiceForm.controls.newServiceTags).controls){
                const t=<FormGroup>tag
                tags.push({key:t.controls.key.value,value:t.controls.value.value});
            }
            service.tags=tags;
            const currentService:FormGroup=<FormGroup>control.controls.find(ser=>
                ser.value.category.toLowerCase().indexOf(this.newServiceForm.controls.newServiceCategory.value.toLowerCase())>-1);

            if(currentService!=undefined){
                for(let tag of tags){
                    let currentTag:FormGroup=<FormGroup>(<FormArray>currentService.controls.tags).controls.find(t=>
                        t.value.key.toLowerCase().indexOf(tag.key.toLowerCase())>-1);
                    if(currentTag==undefined){
                        (<FormArray>currentService.controls.tags).push(this.initTag(tag.key,tag.value));
                    }
                }
            }else{
                control.push(this.initService({category:service.category,tags:tags}));
            }
            
        }
        this.toggleNewService();
    }

    initService(service:IService){
        let group:FormGroup = this.fb.group({
            id:[service._id],
            category:[service.category],
            tags:this.fb.array([])
        });
        for(let tag of service.tags){
            (<FormArray>group.controls.tags).push(this.initTag(tag.key,tag.value));
        }

        return group;        
    }

    removeTag(serviceIndex:number,tagIndex:number){
        this.serviceListChange=true;
        const control = <FormGroup>(<FormArray>this.servForm.controls.services).at(serviceIndex);
        const tags=<FormArray>control.controls.tags;
        if(tags.length==1){
            this.removeService(serviceIndex);
        }else{
            tags.removeAt(tagIndex);
        }   
    }

    removeNewTag(tagIndex:number){
        const control = <FormArray>this.newServiceForm.controls['newServiceTags'];
        control.removeAt(tagIndex);
    }

    addNewTag(serviceIndex:number){
        this.serviceListChange=true;
        const service = <FormGroup>(<FormArray>this.servForm.controls.services).at(serviceIndex);
        if(this.newTagForm.valid){
            const control = <FormArray>service.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==this.newTagForm.controls["newTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newTagForm.controls["newTagKey"].value,this.newTagForm.controls["newTagValue"].value));
        }
        this.toggleTag(serviceIndex);
    }

    addNewBooleanTag(serviceIndex){
        this.serviceListChange=true;
        const service = <FormGroup>(<FormArray>this.servForm.controls.services).at(serviceIndex);
        if(this.newTagForm.valid){
            const control = <FormArray>service.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==this.newTagForm.controls["newTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newTagForm.controls["newTagKey"].value,this.newTagForm.controls["newBooleanTagValue"].value));
        }
    }

    addNewServiceTag(){
        if(this.newServiceForm.controls['newServiceTagKey'].valid&&this.newServiceForm.controls['newServiceTagValue'].valid){
            const control = <FormArray>this.newServiceForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key==this.newServiceForm.controls["newServiceTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newServiceForm.controls["newServiceTagKey"].value,this.newServiceForm.controls["newServiceTagValue"].value));
        }
    }

    addNewServiceBooleanTag(){
        if(this.newServiceForm.controls['newServiceTagKey'].valid){
            const control = <FormArray>this.newServiceForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key==this.newServiceForm.controls["newServiceTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newServiceForm.controls["newServiceTagKey"].value,this.newServiceForm.controls["newServiceBooleanTagValue"].value));
        }
    }

    isBooleanValue(value):boolean{
        if(value==null||(value!==true&&value!==false)){
            return true;
        }else{
            return false;
        }
    }

    initTag(key:String,value:String){
        return this.fb.group({
            key:[key],
            value: [value]
        });
    }

    save(confirm){
        if(this.servForm.valid){
            let shelter:any={_id:this._id,name:this.name};
            let services:IService[]=[]

            for(let s of (<FormArray>this.servForm.controls.services).controls){
                let serv=<FormGroup>s;
                let service:IService={
                    name:serv.value.name,
                    category:serv.value.category,
                    description:serv.value.description,
                };
                if(serv.value.id!=undefined){
                    service._id=serv.value.id;
                }
                let tags:ITag[]=[];
                for (let tag of (<FormArray>serv.controls.tags).controls){
                    tags.push({key:tag.value.key,value:tag.value.value});
                }
                service.tags=tags as [ITag];
                services.push(service);
            }
            this.serviceToRemove.forEach(service=>{
                services.push({_id:service});
            });
            delete(this.serviceToRemove);
    
            shelter.services=services;
            if(!this.newServiceAdded){
                this.revisionService.onChildSave(shelter,"services");
            }else{
                this.revisionService.onChildDelete("services");
            }

            let shelSub=this.shelterService.preventiveUpdateShelter(shelter,"services").subscribe((returnVal)=>{
                if(returnVal){
                    this.displayError=false;
                    if(confirm){
                        this.shared.onMaskConfirmSave("services");
                    }
                }else{
                    console.log(returnVal);
                    this.displayError=true;
                }
                if(shelSub!=undefined){
                    shelSub.unsubscribe();
                }
            });
        }else{
            this.displayError=true;
        }
    }

    initForm(shelter:IShelter){
        this.name=shelter.name;
        for(let service of shelter.services){
            const currentService:FormGroup=<FormGroup>(<FormArray>this.servForm.controls.services).controls.find(serv=>serv.value.category.toLowerCase().indexOf(service.category.toLowerCase())>-1);
            if(currentService==undefined){
                this.serviceList.push({_id:service._id,category:service.category,tags:service.tags});
                (<FormArray>this.servForm.controls.services).push(this.initService(service));
            }else{
                this.serviceListChange=true;
                this.newServiceAdded=true;
                for(let tag of service.tags){
                    let currentTag:FormGroup=<FormGroup>(<FormArray>currentService.controls.tags).controls.find(t=>
                        t.value.key.toLowerCase().indexOf(tag.key.toLowerCase())>-1);
                    if(currentTag==undefined){
                        (<FormArray>currentService.controls.tags).push(this.initTag(tag.key,tag.value));
                    }
                }
                this.serviceToRemove.push(service._id);
            }
            
        }

    }  

    ngOnDestroy(){
        if(this.serviceListChange||this.servForm.dirty){
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

    getService(id):Promise<IShelter>{
        return new Promise<IShelter>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.services!=undefined){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                }else{
                    let shelSub=this.shelterService.getShelterSection(id,"services").subscribe(shelter=>{
                        if(shelter.services==undefined) shelter.services=[] as [IService];
                        this.revisionService.onChildSave(shelter,"services");
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
            this.revisionService.onChildLoadRequest("services");
        });
    }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.getService(params["id"])
            .then(shelter=>{
                this.initForm(shelter);
                if(routeSub!=undefined){
                    routeSub.unsubscribe();
                }
            });
        });

    }
}