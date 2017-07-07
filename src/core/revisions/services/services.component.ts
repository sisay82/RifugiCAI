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
    data:IService[];
    serviceToRemove:String[]=[];
    currentService:number=0;
    displaySave:Boolean=false;
    displayError:boolean=false;
    activeComponentSub:Subscription;
    maskSaveSub:Subscription;
    serviceListChange:boolean=false;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.servForm = fb.group({
            services:fb.array([]),
            newServiceName:["Nome Nuovo Servizio",[Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/),Validators.required]],
            newServiceCategory:["Categoria Nuovo Servizio",Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/)],
            newServiceDescription:["Descrizione Nuovo Servizio",Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/)],
            newServiceTags:fb.array([]),
            newServiceTagKey:["Chiave Tag",Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/)],
            newServiceTagValue:["Valore Tag",Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/)]
        }); 

        shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(this.serviceListChange||this.servForm.dirty){
                this.save(true);
            }else{
                shared.onMaskConfirmSave(false,"services");
            }
        });

        this.activeComponentSub=shared.activeComponentRequest$.subscribe(()=>{
            shared.onActiveComponentAnswer("services");
        });
    } 

    toggle(index): void {
        if(this.currentService==index){
            this.currentService=-1;
        }else{
            this.currentService=index;
        }
    }

    isCollapsed(index): boolean {
        if(this.currentService==index){
            return false;
        }
        return true;
    }

    removeService(index){
        this.serviceListChange=true;
        const control = <FormArray>this.servForm.controls['services'];
        let service=this.data.filter(ser=>control.at(index).value.id==ser._id)
        if(service.length>0){
            this.serviceToRemove.push(service[0]._id);
        }
        control.removeAt(index);
    }

    addNewService(){
        if(this.servForm.controls['newServiceName'].valid&&
            this.servForm.controls['newServiceCategory'].valid&&
            this.servForm.controls['newServiceDescription'].valid){
            const services = <FormArray>this.servForm.controls['services'];

            let service:IService={
                name:this.servForm.controls['newServiceName'].value,
                category:this.servForm.controls['newServiceCategory'].value,
                description:this.servForm.controls['newServiceDescription'].value
            }
            let tags:any=[];

            for(let tag of (<FormArray>this.servForm.controls["newServiceTags"]).controls){
                tags.push(tag.value.key,tag.value.value);
            }
            service.tags=tags;
            services.push(this.initService(service));
        }
    }

    initService(service:IService){
        let group:FormGroup = this.fb.group({
            id:[service._id],
            name:[service.name,Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)*$/)],
            category: [service.category,Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)*$/)],
            description: [service.description,Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)*$/)],
            tags:this.fb.array([]),
            newTagKey:["Chiave Tag",Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/)],
            newTagValue:["Valore Tag",Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)+$/)]
        });

        for(let tag of service.tags){
            (<FormArray>group.controls["tags"]).push(this.initTag(tag.key,tag.value));
        }

        return group;        
    }

    removeTag(serviceIndex:number,index:number){
        this.serviceListChange=true;
        const control = <FormGroup>(<FormArray>this.servForm.controls['services']).at(serviceIndex);
        const tag=<FormArray>control.controls['tags'];
        tag.removeAt(index);
    }

    addNewTag(serviceIndex){
        const service = <FormGroup>(<FormArray>this.servForm.controls['services']).at(serviceIndex);
        if(service.controls['newTagKey'].valid&&service.controls['newTagValue'].valid){
            const control = <FormArray>service.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==service.controls["newKey"].value){
                    return;
                }
            }
            control.push(this.initTag(service.controls["newKey"].value,service.controls["newValue"].value));
        }
    }

    addNewServiceTag(){
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

    addNewBoolTag(serviceIndex,key:String){
        const service = <FormGroup>(<FormArray>this.servForm.controls['services']).at(serviceIndex);
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
            key:[key,Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)*$/)],
            value: [value,Validators.pattern(/^([A-Za-z0-9À-ÿ ,.:;!?|)(_-]*)*$/)]
        });
    }

    save(confirm){
        let shelter:any={_id:this._id,name:this.name};
        let services:IService[]=[]

        for(let serv of (<FormArray>this.servForm.controls["services"]).controls){
            let service:IService={
                _id:serv.value.id,
                name:serv.value.name,
                category:serv.value.category,
                description:serv.value.description,
            };
            let tags:ITag[]=[];
            let tagControls=serv.value.tags;
            for (let tag of tagControls){
                tags.push({key:tag.key,value:tag.value});
            }
            service.tags=tags as [ITag];
            services.push(service);
        }
        this.serviceToRemove.forEach(service=>{
            services.push({_id:service})
        });
        shelter.services=services;
        this.revisionService.onChildSave(shelter,"services");
        let shelSub=this.shelterService.preventiveUpdateShelter(shelter,"services").subscribe((returnVal)=>{
            if(returnVal){
                this.displaySave=true;
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave(true,"services");
                }
                //location.reload();
            }else{
                console.log(returnVal);
                this.displayError=true;
                this.displaySave=false;
            }
            if(shelSub!=undefined){
                shelSub.unsubscribe();
            }
        });
    }

    initForm(shelter:IShelter){
        this.name=shelter.name;
        this.data=shelter.services;
        for(let service of shelter.services){
            if(service.category==undefined&&service.name==undefined&&service.description==undefined&&service.tags==undefined){
                this.serviceToRemove.push(service._id);
            }else{
                (<FormArray>this.servForm.controls["services"]).push(this.initService(service));
            }
        }
    }   

    ngOnDestroy(){
        if(this.serviceListChange||this.servForm.dirty){
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
                if(shelter!=null&&shelter.services!=undefined){
                    this.initForm(shelter);
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    if(routeSub!=undefined){
                        routeSub.unsubscribe();
                    }
                }else{
                    let shelSub=this.shelterService.getShelterSection(params['id'],"services").subscribe(shelter=>{
                        this.initForm(shelter);
                        if(shelSub!=undefined){
                            shelSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        if(routeSub!=undefined){
                            routeSub.unsubscribe();
                        }
                    });
                }
            });
            this.revisionService.onChildLoadRequest("services");
            
        });

    }
}