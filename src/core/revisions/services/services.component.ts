import {
  Component,Input,OnInit, trigger, state, style, transition, animate//,OnDestroy
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IButton, IShelter, IService, ITag } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';
import {BcSharedService,ServiceBase,ServicePlaceholders} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {RevisionBase} from '../shared/revision_base';

@Component({
  moduleId: module.id,
  selector: 'bc-serv-revision',
  templateUrl: 'services.component.html',
  styleUrls: ['services.component.scss'],
  providers:[ShelterService],
  animations: [ Animations.slideInOut ]
})
export class BcServRevision extends RevisionBase {
    servForm: FormGroup; 
    newServiceForm: FormGroup;
    newTagForm: FormGroup;
    serviceToRemove:String[]=[];
    serviceList:IService[]=[];
    currentServiceTag:number=-1;
    serviceHidden:boolean=true;
    invalidTag:boolean=false;
    invalidService:boolean=false;
    newServiceAdded=false;
    newTagHidden:boolean=true;
    serviceListChange:boolean=false;
    placeholders:ServicePlaceholders;
    constructor(shared:BcSharedService,shelterService:ShelterService,router:Router,_route:ActivatedRoute,private fb: FormBuilder,revisionService:BcRevisionsService) { 
        super(shelterService,shared,revisionService,_route,router);
        this.placeholders=new ServicePlaceholders()
        this.servForm = fb.group({
            services:fb.array([])
        }); 

        this.newServiceForm = fb.group({
            newServiceName:["Nome Nuovo Servizio"],
            newServiceDescription:["Descrizione Nuovo Servizio"],
            newServiceCategory:["Nuova categoria"],
            newServiceTags:fb.array([]),
            newServiceTagKey:["Informazione"],
            newServiceTagValue:["Valore"]
        });

        this.newTagForm = fb.group({
            newTagKey:["Informazione"],
            newTagValue:["Valore"],
        });

        this.formValidSub = this.servForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(!this.maskError){
                    this.displayError=false;
                }
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.servForm.valid){
                if(this.serviceListChange||this.servForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave(Enums.Routed_Component.services);
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });

        shared.activeComponent=Enums.Routed_Component.services;
    } 

    getFormControls(controlName){
        return (<FormGroup>this.servForm.controls[controlName]).controls;
    }

    getControl(control:FormGroup,controlName){
        return control.controls[controlName];
    }

    getFormControlsByControl(control:FormGroup,controlName){
        return (<FormGroup>this.getControl(control,controlName)).controls;
    }

    checkValidForm(){
        return this.servForm.valid;
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
                if(!this.serviceToRemove){
                    this.serviceToRemove=[];
                }
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
            this.resetServiceForm();
        }else{
            this.invalidService=true;
        }
        
    }

    resetServiceForm(){
        this.newServiceForm = this.fb.group({
            newServiceName:["Nome Nuovo Servizio"],
            newServiceDescription:["Descrizione Nuovo Servizio"],
            newServiceCategory:["Nuova categoria"],
            newServiceTags:this.fb.array([]),
            newServiceTagKey:["Informazione"],
            newServiceTagValue:["Valore"]
        });
        this.toggleNewService();
    }

    initService(service:IService){
        let group:FormGroup = this.fb.group({
            id:[service._id],
            category:[service.category],
            tags:this.fb.array([])
        });
        for(let tag of service.tags){
            (<FormArray>group.controls.tags).push(this.initTag(tag.key,tag.value,tag.type));
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

    resetTagForm(serviceIndex){
        if(serviceIndex>-1){ 
            this.newTagForm = this.fb.group({
                newTagKey:["Informazione"],
                newTagValue:["Valore"],
            });
            this.toggleTag(serviceIndex);
        }
        else{
            this.newServiceForm.controls.newServiceTagKey.setValue("Informazione");
            this.newServiceForm.controls.newServiceTagValue.setValue("Valore");

            this.toggleNewTag();
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
                if(c.value.key.toLowerCase().indexOf(this.newTagForm.controls["newTagKey"].value.toLowerCase())>-1){
                    this.invalidTag=true;
                    return;
                }
            }
            control.push(this.initTag(this.newTagForm.controls["newTagKey"].value,this.newTagForm.controls["newTagValue"].value));
            this.resetTagForm(serviceIndex);
        }else{
            this.invalidTag=true;
        }
    }

    addNewServiceTag(){
        if(this.newServiceForm.controls['newServiceTagKey'].valid&&this.newServiceForm.controls['newServiceTagValue'].valid){
            const control = <FormArray>this.newServiceForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key.toLowerCase().indexOf(this.newServiceForm.controls["newServiceTagKey"].value.toLowerCase())>-1){
                    this.invalidService=true;
                    return;
                }
            }
            control.push(this.initTag(this.newServiceForm.controls["newServiceTagKey"].value,this.newServiceForm.controls["newServiceTagValue"].value));
            this.resetTagForm(-1);
        }else{
            this.invalidService=true;
        }
    }

    initTag(key:String,value:String,type?:String){
        if(type){
            return this.fb.group({
                key:[key],
                value: [value],
                type:type
            });
        }else{
            return this.fb.group({
                key:[key],
                value: [value]
            });
        }
    }

    save(confirm){
        if(!confirm||this.servForm.valid){
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
                let tags:ITag[]=this.getFormArrayValues(<FormArray>serv.controls.tags).filter(val=>val.key&&val.value);
                service.tags=tags as [ITag];
                services.push(service);
            }
            
            if(this.serviceToRemove){
                this.serviceToRemove.forEach(service=>{
                    services.push({_id:service});
                });
            }
            delete(this.serviceToRemove);
    
            shelter.services=services;
            if(!this.newServiceAdded){
                this.revisionService.onChildSave(shelter,"services");
            }else{
                this.revisionService.onChildDelete("services");
            }

            this.processSavePromise(shelter,"services")
            .then(()=>{
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave("services");
                }
            })
            .catch(err=>{
                console.log(err);
                this.displayError=true;
            });

        }else{
            this.displayError=true;
        }
    }

    getValidator(value){
        switch(value){
            case("number"):{
                return "numberValidator";
            };
            case("string"):{
                return "stringValidator";
            };
            default:{
                return "stringValidator"; 
            }
        }
    }

    uglifyString(str:String):string{
        return str.replace(/(\s)/g,"_");
    }
    
    decapitalize(str:String):string{
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    getPlaceholder(category,name){
        category=this.uglifyString(category);
        name=this.uglifyString(name);

        if(this.placeholders.service[category.toLowerCase()]){
            category=category.toLowerCase();
        }else if(this.placeholders.service[this.decapitalize(category)]){
            category=this.decapitalize(category);
        }else if(!this.placeholders.service[category]){
            return "";
        }

        if(this.placeholders.service[category][name.toLowerCase()]){
            name=name.toLowerCase();
        }else if(this.placeholders.service[category][this.decapitalize(name)]){
            name=this.decapitalize(name);
        }else if(!this.placeholders.service[category][name]){
            return "";
        }

        return this.placeholders.service[category][name];

    }

    initForm(shelter:IShelter){
        this.name=shelter.name;
        let serviceList=new ServiceBase();
        for(let category of Object.getOwnPropertyNames(serviceList)){
            let s:IService={};
            s.name=s.category=category;
            s.tags=[] as [ITag];
            let serv=shelter.services.find(obj=>obj.category&&obj.category==category);
            for(let service of Object.getOwnPropertyNames(serviceList[category])){
                let tag={key:service,value:null,type:typeof(serviceList[category][service])};
                if(serv!=undefined){
                    s._id=serv._id;
                    let t=serv.tags.find(obj=>obj.key==tag.key);
                    if(t!=undefined){
                        tag.value=t.value;
                    }
                }else{
                    this.serviceListChange=true;
                }
                s.tags.push(tag);
            }
            this.serviceList.push(s);
            (<FormArray>this.servForm.controls.services).push(this.initService(s));
        }
        let servRemove:IService[]=shelter.services.filter(obj=>{
            if(obj._id){
                for(let serv of this.serviceList){
                    if(serv._id){
                        if(serv._id.toLowerCase().indexOf(obj._id.toString())>-1){
                            return false;
                        }
                    }
                }
            }
            
            return true;
        });
        
        servRemove.forEach(val=>{
            if(!this.serviceToRemove){
                this.serviceToRemove=[val._id];
            }else{
                this.serviceToRemove.push(val._id);
            }
        });
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

    init(shelId){
        this.getService(shelId)
        .then(shelter=>{
            this.initForm(shelter);
        });
    }
}