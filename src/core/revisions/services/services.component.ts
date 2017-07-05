import {
  Component,Input,OnInit, trigger, state, style, transition, animate//,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IButton, IShelter, IService, ITag } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';

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
    currentService:number=0;
    displaySave:Boolean=false;
    displayError:boolean=false;
    constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.servForm = fb.group({
            services:fb.array([
            ]),
            newServiceName:["Nome Nuovo Servizio",[Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/),Validators.required]],
            newServiceCategory:["Categoria Nuovo Servizio",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)],
            newServiceDescription:["Descrizione Nuovo Servizio",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)],
            newServiceTags:fb.array([]),
            newServiceTagKey:["Chiave Tag",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)],
            newServiceTagValue:["Valore Tag",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)]
        }); 
    } 

    public toggle(index): void {
        if(this.currentService==index){
            this.currentService=-1;
        }else{
            this.currentService=index;
        }
    }

    public isCollapsed(index): boolean {
        if(this.currentService==index){
            return false;
        }
        return true;
    }

    removeService(index){
        const control = <FormArray>this.servForm.controls['services'];
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
            name:[service.name,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            category: [service.category,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            description: [service.description,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            tags:this.fb.array([]),
            newTagKey:["Chiave Tag",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)],
            newTagValue:["Valore Tag",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/)]
        });

        for(let tag of service.tags){
            (<FormArray>group.controls["tags"]).push(this.initTag(tag.key,tag.value));
        }

        return group;
    }

    removeTag(serviceIndex:number,index:number){
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
            key:[key,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            value: [value,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]
        });
    }

    click(ref:any){
        let shelter:any={_id:ref._id,name:ref.name};
        let services:IService[]=[]

        for(let serv of (<FormArray>ref.servForm.control["services"]).controls){
            let service:IService={
                name:serv.value.name,
                category:serv.value.category,
                description:serv.value.description,
            };
            let tags:any=[];
            for (let tag of (<FormArray>serv.value.tags).controls){
                tags.push({key:tag.value.key,value:tag.value.value});
            }
            service.tags=tags;
            services.push(service);
        }
        shelter.services=services;
        ref.revisionService.onChildSave(shelter,"services");
        ref.shelterService.preventiveUpdateShelter(shelter,"services").subscribe((returnVal)=>{
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

    initForm(shelter:IShelter){
        this.name=shelter.name;
        this.data=shelter.services;
        for(let service of shelter.services){
            (<FormArray>this.servForm.controls["services"]).push(this.initService(service));
        }
    }   

    ngOnDestroy(){
        if(this.servForm.dirty){
            this.click(this);
        }
    }

    ngOnInit(){
        this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.services!=undefined){
                    this.initForm(shelter);
                    
                }else{
                    this.shelterService.getShelterSection(params['id'],"services").subscribe(shelter=>{
                        if(shelter.services!=undefined){
                            this.initForm(shelter);
                        }
                    });
                }

            });
            this.revisionService.onChildLoadRequest("services");
        });

    }
}