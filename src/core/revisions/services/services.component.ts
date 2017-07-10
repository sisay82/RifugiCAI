import {
  Component,Input,OnInit, trigger, state, style, transition, animate//,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IButton, IShelter, IService, ITag } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

let stringValidator=/^([A-Za-z0-99À-ÿ� ,.:/';!?|)(_-]*)*$/;
let telephoneValidator=/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
let mailValidator=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let numberValidator=/^[0-9]+[.]{0,1}[0-9]*$/;
let urlValidator=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

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
    newCatForm: FormGroup;
    newTagForm: FormGroup;
    serviceCategories:{name:String,services:IService[]}[]=[];
    serviceToRemove:String[]=[];
    currentServiceTag:number=-1;
    currentCategoryService:number=-1;
    currentCategoryTag:number=0;
    hideCategoryAdd:boolean=true;
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

        this.newCatForm = fb.group({
            newCategory:["Nuova Categoria",Validators.pattern(stringValidator)]
        });

        this.newServiceForm = fb.group({
            newServiceName:["Nome Nuovo Servizio",[Validators.pattern(stringValidator),Validators.required]],
            newServiceDescription:["Descrizione Nuovo Servizio",Validators.pattern(stringValidator)],
            newServiceTags:this.fb.array([]),
            newServiceTagKey:["Chiave Tag",Validators.pattern(stringValidator)],
            newServiceTagValue:["Valore Tag",Validators.pattern(stringValidator)]
        });

        this.newTagForm = fb.group({
            newTagKey:["Chiave Tag",Validators.pattern(stringValidator)],
            newTagValue:["Valore Tag",Validators.pattern(stringValidator)]
        });

        shared.onActiveOutletChange("revision");

        this.formValidSub = this.servForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                this.displayError=false;
            }else if(value=="INVALID"){
                this.displayError=true;
            }
        });

        this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
            this.maskError=true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(()=>{
            this.maskError=false;
        });

        shared.activeComponent="services";

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(this.serviceListChange||this.servForm.dirty){
                this.disableSave=true;
                this.save(true);
            }else{
                this.shared.onMaskConfirmSave("services");
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

    toggleService(categoryIndex:number): void {
        if(this.currentCategoryService==categoryIndex){
            this.currentCategoryService=-1;
        }else{
            this.currentCategoryService=categoryIndex;
        }
    }

    isHiddenService(categoryIndex): boolean {
        if(this.currentCategoryService==categoryIndex){
            return false;
        }
        return true;
    }

    toggleCategory(): void {
        this.hideCategoryAdd=!this.hideCategoryAdd;
    }

    isHiddenCategory(): boolean {
        return this.hideCategoryAdd;
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

    addNewCategory(){
        this.serviceListChange=true;
        if(this.newCatForm.valid){
            const control = (<FormArray>this.servForm.controls["categories"]);
            if(control.controls.find(cat=>cat.value.name==this.newCatForm.controls["newCategory"].value)==undefined){
                let category={
                    name:this.newCatForm.controls["newCategory"].value,
                    services:[]
                };
                control.push(this.initCategory(category));   
            }
        }
        this.toggleCategory();
    }

    addNewService(categoryIndex:number){
        this.serviceListChange=true;
        this.newServiceAdded=true;
        
        if(this.newServiceForm.valid){
            const category:FormGroup=<FormGroup>(<FormArray>this.servForm.controls["categories"]).at(categoryIndex);
            let service:IService={
                name:this.newServiceForm.controls.newServiceName.value,
                category:category.value.name,
                description:this.newServiceForm.controls.newServiceDescription.value
            }
            let tags:any=[];

            for(let tag of (<FormArray>this.newServiceForm.controls.newServiceTags).controls){
                tags.push(tag.value.key,tag.value.value);
            }
            service.tags=tags;
            (<FormArray>category.controls.services).controls.push(this.initService(service));
        }
        this.toggleService(categoryIndex);
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
            name:[service.name,Validators.pattern(stringValidator)],
            category: [service.category,Validators.pattern(stringValidator)],
            description: [service.description,Validators.pattern(stringValidator)],
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
            key:[key,Validators.pattern(stringValidator)],
            value: [value,Validators.pattern(stringValidator)]
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