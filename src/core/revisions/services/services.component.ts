import {
  Component,Input,OnInit, trigger, state, style, transition, animate//,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IButton, IShelter, IService, ITag } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';
import { BcSharedService } from '../../../app/shelter/shelterPage/shared.service';
import { Subscription } from 'rxjs/Subscription';

let stringValidator=/^([A-Za-z0-99À-ÿ ,.:/;!?|)(_-]*)*$/;
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
    serviceCategories:{name:String,services:IService[]}[]=[];
    serviceToRemove:String[]=[];
    currentServiceTag:number=-1;
    currentCategoryService:number=-1;
    currentCategoryTag:number=0;
    hideCategoryAdd:boolean=true;
    displayError:boolean=false;
    activeComponentSub:Subscription;
    maskSaveSub:Subscription;
    disableSave=false;
    newServiceAdded=false;
    serviceListChange:boolean=false;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.servForm = fb.group({
            categories:fb.array([]),
            newCategory:["Nuova Categoria",Validators.pattern(stringValidator)]
        }); 

        shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            
            //if(this.serviceListChange||this.servForm.dirty){
                this.disableSave=true;
                this.save(true);
            //}else{
            //    shared.onMaskConfirmSave(false,"services");
            //}
        });

        this.activeComponentSub=shared.activeComponentRequest$.subscribe(()=>{
            shared.onActiveComponentAnswer("services");
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
        const control = <FormArray>(<FormGroup>(<FormArray>this.servForm.controls['categories']).at(categoryIndex)).controls.services;
        const serv = <FormGroup>control.at(serviceIndex);
        let service=this.serviceCategories[categoryIndex].services.find(ser=>serv.value.id==ser._id)
        if(service!=undefined){
            this.serviceToRemove.push(service._id);
        }
        control.removeAt(serviceIndex);
    }

    addNewCategory(){
        this.serviceListChange=true;
        if(this.servForm.controls["newCategory"].valid){
            const control = (<FormArray>this.servForm.controls["categories"]);
            if(control.controls.find(cat=>cat.value.name==this.servForm.controls["newCategory"].value)==undefined){
                let category={
                    name:this.servForm.controls["newCategory"].value,
                    services:[]
                };
                (<FormArray>this.servForm.controls["categories"]).push(this.initCategory(category));   
            }
        }
        this.toggleCategory();
    }

    addNewService(categoryIndex:number){
        this.serviceListChange=true;
        this.newServiceAdded=true;
        const category:FormGroup=<FormGroup>(<FormArray>this.servForm.controls["categories"]).at(categoryIndex);
        if(category.controls.newServiceName.valid&&
            category.controls.newServiceDescription.valid){

            let service:IService={
                name:category.controls.newServiceName.value,
                category:category.value.name,
                description:category.controls.newServiceDescription.value
            }
            let tags:any=[];

            for(let tag of (<FormArray>category.controls.newServiceTags).controls){
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
            newServiceName:["Nome Nuovo Servizio",[Validators.pattern(stringValidator),Validators.required]],
            newServiceDescription:["Descrizione Nuovo Servizio",Validators.pattern(stringValidator)],
            newServiceTags:this.fb.array([]),
            newServiceTagKey:["Chiave Tag",Validators.pattern(stringValidator)],
            newServiceTagValue:["Valore Tag",Validators.pattern(stringValidator)]
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
            tags:this.fb.array([]),
            newTagKey:["Chiave Tag",Validators.pattern(stringValidator)],
            newTagValue:["Valore Tag",Validators.pattern(stringValidator)]
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
        if(service.controls['newTagKey'].valid&&service.controls['newTagValue'].valid){
            const control = <FormArray>service.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==service.controls["newTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(service.controls["newTagKey"].value,service.controls["newTagValue"].value));
        }
        this.toggleTag(categoryIndex,serviceIndex);
    }

    addNewServiceTag(){
        this.serviceListChange=true;
        if(this.servForm.controls['newServiceTagKey'].valid&&this.servForm.controls['newServiceTagValue'].valid){
            const control = <FormArray>this.servForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key==this.servForm.controls["newServiceTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.servForm.controls["newServiceTagKey"].value,this.servForm.controls["newServiceTagValue"].value));
        }
    }

    addNewServiceBoolTag(){
        this.serviceListChange=true;
        if(this.servForm.controls['newServiceTagKey'].valid&&this.servForm.controls['newServiceTagValue'].valid){
            const control = <FormArray>this.servForm.controls['newServiceTags'];
            for(let c of control.controls){
                if(c.value.key==this.servForm.controls["newServiceTagKey"].value){
                    return;
                }
            }
            control.push(this.initTag(this.servForm.controls["newServiceTagKey"].value,"true"));
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
        if(this.activeComponentSub!=undefined){
            this.activeComponentSub.unsubscribe();
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
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