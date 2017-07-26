import {
  Component,Input,OnInit, trigger, state, style, transition, animate,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IButton, IShelter, IService, ITag } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {validators} from '../../inputs/text/text_input.component';

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
    serviceCategories:{name:String,services:IService[]}[]=[];
    serviceToRemove:String[]=[];
    currentServiceTag:number=-1;
    serviceHidden:boolean=true;
    currentCategoryTag:number=0;
    displayError:boolean=false;
    maskSaveSub:Subscription;
    disableSave=false;
    newServiceAdded=false;
    serviceListChange:boolean=false;
    maskInvalidSub:Subscription;
    maskValidSub:Subscription;
    maskError:boolean=false;
    formValidSub:Subscription;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.servForm = fb.group({
            categories:fb.array([])
            
        }); 

        this.newServiceForm = fb.group({
            newServiceName:["Nome Nuovo Servizio",[Validators.pattern(validators.stringValidator),Validators.required]],
            newServiceDescription:["Descrizione Nuovo Servizio",Validators.pattern(validators.stringValidator)],
            newServiceCategory:["Categoria Nuovo Servizio",Validators.pattern(validators.stringValidator)],
            newServiceTags:this.fb.array([]),
            newServiceTagKey:["Informazione",Validators.pattern(validators.stringValidator)],
            newServiceTagValue:["Valore",Validators.pattern(validators.stringValidator)]
        });

        this.newTagForm = fb.group({
            newTagKey:["Informazione",[Validators.pattern(validators.stringValidator),Validators.required]],
            newTagValue:["Valore",Validators.pattern(validators.stringValidator)]
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

    toggleTag(categoryIndex:number,serviceIndex:number): void {
        if(this.currentCategoryTag==categoryIndex){
            this.currentCategoryTag=categoryIndex;
            if(this.currentServiceTag==serviceIndex){
                this.currentServiceTag=-1;
            }else{
                this.currentServiceTag=serviceIndex;
            }
        }else{
            this.currentCategoryTag=categoryIndex;
            this.currentServiceTag=serviceIndex;
        }
    }

    isHiddenTag(categoryIndex,serviceIndex): boolean {
        if(this.currentServiceTag==serviceIndex&&this.currentCategoryTag==categoryIndex){
            return false;
        }
        return true;
    }

    toggleService(): void {
        this.serviceHidden=!this.serviceHidden;
    }

    isHiddenService(): boolean {
        return this.serviceHidden;
    }

    removeService(categoryIndex,serviceIndex){
        this.serviceListChange=true;
        const category=<FormGroup>(<FormArray>this.servForm.controls['categories']).at(categoryIndex);
        const services = <FormArray>category.controls.services;
        const serv = <FormGroup>services.at(serviceIndex);
        if(this.serviceCategories[categoryIndex]!=undefined){
            let service=this.serviceCategories[categoryIndex].services.find(ser=>serv.value.id==ser._id)
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
            const control=(<FormArray>this.servForm.controls["categories"]);
            
            let service:IService={
                name:this.newServiceForm.controls.newServiceName.value,
                category:this.newServiceForm.controls.newServiceCategory.value,
                description:this.newServiceForm.controls.newServiceDescription.value
            }
            let tags:any=[];

            for(let tag of (<FormArray>this.newServiceForm.controls.newServiceTags).controls){
                tags.push(tag.value.key,tag.value.value);
            }
            service.tags=tags;
            const category:FormGroup=<FormGroup>control.controls.find(cat=>
                cat.value.name.toLowerCase().indexOf(this.newServiceForm.controls.newServiceCategory.value.toLowerCase())>-1);
            if(category!=undefined){
                (<FormArray>category.controls.services).controls.push(this.initService(service));
            }else{
                control.push(this.initCategory({name:service.category,services:[service]}));
            }
            
        }
        this.toggleService();
    }

    initCategory(category:{name:String,services:IService[]}){
        let group:FormGroup = this.fb.group({
            name:category.name,//Not Change
            services:this.fb.array([]),
        });

        for(let service of category.services){
            (<FormArray>group.controls.services).push(this.initService(service));
        }

        return group;
    }

    initService(service:IService){
        let group:FormGroup = this.fb.group({
            id:[service._id],
            name:[service.name,[Validators.pattern(validators.stringValidator),Validators.required]],
            category: [service.category,Validators.pattern(validators.stringValidator)],
            description: [service.description,Validators.pattern(validators.stringValidator)],
            tags:this.fb.array([])
        });

        for(let tag of service.tags){
            (<FormArray>group.controls["tags"]).push(this.initTag(tag.key,tag.value));
        }

        return group;        
    }

    removeTag(categoryIndex:number,serviceIndex:number,tagIndex:number){
        this.serviceListChange=true;
        const control = <FormGroup>(<FormArray>(<FormGroup>(<FormArray>this.servForm.controls['categories']).at(categoryIndex)).controls.services).at(serviceIndex);
        const tag=<FormArray>control.controls.tags;
        tag.removeAt(tagIndex);
    }

    addNewTag(categoryIndex:number,serviceIndex:number){
        this.serviceListChange=true;
        const service = <FormGroup>(<FormArray>(<FormGroup>(<FormArray>this.servForm.controls['categories']).at(categoryIndex)).controls.services).at(serviceIndex);
        if(this.newTagForm.valid){
            const control = <FormArray>service.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==this.newTagForm.controls["newTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newTagForm.controls["newTagKey"].value,this.newTagForm.controls["newTagValue"].value));
        }
        this.toggleTag(categoryIndex,serviceIndex);
    }

    addNewServiceTag(){
        this.serviceListChange=true;
        if(this.newServiceForm.controls['newServiceTagKey'].valid&&this.newServiceForm.controls['newServiceTagValue'].valid){
            const control = <FormArray>this.servForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key==this.newServiceForm.controls["newServiceTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newServiceForm.controls["newServiceTagKey"].value,this.newServiceForm.controls["newServiceTagValue"].value));
        }
    }

    addNewServiceBoolTag(){
        this.serviceListChange=true;
        if(this.newServiceForm.controls['newServiceTagKey'].valid&&this.newServiceForm.controls['newServiceTagValue'].valid){
            const control = <FormArray>this.servForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key==this.newServiceForm.controls["newServiceTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.newServiceForm.controls["newServiceTagKey"].value,"true"));
        }
    }

    addNewBoolTag(categoryIndex,serviceIndex,key:String){
        this.serviceListChange=true;
        const service = (<FormArray>this.servForm.controls['categories']).at(categoryIndex).value.services.at(serviceIndex);
        if(service.controls['newTagKey'].valid){
            const control = <FormArray>service.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==service.controls["newKey"].value){
                    return;
                }
            }
            control.push(this.initTag(service.controls["newKey"].value,"true"));
        }
    }

    initTag(key:String,value:String){
        return this.fb.group({
            key:[key,Validators.pattern(validators.stringValidator)],
            value: [value,Validators.pattern(validators.stringValidator)]
        });
    }

    save(confirm){
        if(this.servForm.valid){
            let shelter:any={_id:this._id,name:this.name};
            let services:IService[]=[]

            for(let c of (<FormArray>this.servForm.controls["categories"]).controls){
                const cat=<FormGroup>c;
                for(let s of (<FormArray>cat.controls.services).controls){
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
            if(service.category==undefined&&service.name==undefined&&service.description==undefined&&service.tags==undefined){
                this.serviceToRemove.push(service._id);
            }else{
                if(service.category!=undefined){
                    let category=this.serviceCategories.find(cat=>cat.name==service.category);
                    if(category!=undefined){
                        category.services.push(service);
                    }else{
                        category={
                            name:service.category,
                            services:[service]
                        }
                        this.serviceCategories.push(category);
                    }
                }else{
                    this.serviceCategories.push({
                        name:"",
                        services:[service]
                    });
                }
            }
        }

        for(let category of this.serviceCategories){
            (<FormArray>this.servForm.controls["categories"]).push(this.initCategory(category));
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