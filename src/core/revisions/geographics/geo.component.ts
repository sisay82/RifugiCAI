import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shelter/shelterPage/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-geo-revision',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeoRevision {
    _id:String;
    name:String;
    geoForm: FormGroup; 
    data:IGeographic;
    invalid:boolean=false;
    displaySave:Boolean=false;
    activeComponentSub:Subscription;
    maskSaveSub:Subscription;
    tagChange:boolean=false
    displayError:boolean=false;
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.geoForm = fb.group({
            region:["",[Validators.required,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]],//required and string
            province:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],//string with some character
            municipality:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            locality:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            ownerRegion:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            authorityJurisdiction:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            altitude:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],//number
            latitude:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],
            longitude:["",Validators.pattern(/^[0-9]+[.]{0,1}[0-9]*$/)],
            massif:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            valley:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            tags:fb.array([]),
            newKey:["Chiave",[Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/),Validators.required]],
            newValue:["Valore",[Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/),Validators.required]]
        }); 

        shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(this.tagChange||this.geoForm.dirty){
                this.save(true);
            }else{
                this.shared.onMaskConfirmSave(false,"geographic");
            }
            
        });

        this.activeComponentSub=shared.activeComponentRequest$.subscribe(()=>{
            shared.onActiveComponentAnswer("geographic");
        });
    } 

    addTag(key:String,value:String){
        const control = <FormArray>this.geoForm.controls['tags'];
        control.push(this.initTag(key,value));
    }

    removeTag(index){
        this.tagChange=true;
        const control = <FormArray>this.geoForm.controls['tags'];
        control.removeAt(index);
    }

    addNewTag(key:String,value:String){
        this.tagChange=true;
        if(this.geoForm.controls['newKey'].valid&&this.geoForm.controls['newValue'].valid){
            const control = <FormArray>this.geoForm.controls['tags'];
            for(let c of control.controls){
                if(c.value.key==this.geoForm.controls["newKey"].value){
                    this.invalid=true;
                    return;
                }
            }
            this.invalid=false;
            control.push(this.initTag(this.geoForm.controls["newKey"].value,this.geoForm.controls["newValue"].value));
        }
    }

    initTag(key:String,value:String){
        return this.fb.group({
            key:[key,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
            value: [value,Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]
        });
    }

    save(confirm){
        let shelter:IShelter={_id:this._id,name:this.name,geoData:{location:this.data.location}};
        for(let prop in this.geoForm.controls){
            if(this.geoForm.controls[prop].dirty){
                shelter.geoData.location[prop]=this.geoForm.controls[prop].value;
            }
        }
        const control = <FormArray>this.geoForm.controls['tags'];
        let tags:any=[];
        for(let c of control.controls){
            tags.push({key:c.value.key,value:c.value.value});
        }
        shelter.geoData.tags=tags;
        this.revisionService.onChildSave(shelter,"geoData");
        let shelSub=this.shelterService.preventiveUpdateShelter(shelter,"geoData").subscribe((returnVal)=>{
            if(returnVal){
                this.displaySave=true;
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave(true,"geographic");
                }
                //location.reload();
            }else{
                console.log("Err "+returnVal);
                this.displayError=true;
                this.displaySave=false;
            }
            if(shelSub!=undefined){
                shelSub.unsubscribe();
            }
        });
    }

    initForm(shelter){
        this.name=shelter.name;
        this.data=shelter.geoData;

        if(this.data!=undefined){
            if(this.data.location!=undefined){
                for(let prop in this.data.location){
                    if(this.data.location.hasOwnProperty(prop)){
                        if(this.geoForm.contains(prop)){
                            this.geoForm.controls[prop].setValue(this.data.location[prop]);
                            this.geoForm.controls[prop].markAsTouched();
                        }
                    }
                }
            }
            if(this.data.tags!=undefined){
                for(let tag of this.data.tags){
                    this.addTag(tag.key,tag.value);
                }
            }
        }
    }   

    ngOnDestroy(){
        if(this.tagChange||this.geoForm.dirty){
            this.save(false);
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
        if(this.activeComponentSub!=undefined){
            this.activeComponentSub.unsubscribe();
        }
        
    }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.geoData!=undefined){
                    this.initForm(shelter);
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    if(routeSub!=undefined){
                        routeSub.unsubscribe();
                    }
                }else{
                    let shelSub=this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
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
            this.revisionService.onChildLoadRequest("geoData");
            
        });

    }
}