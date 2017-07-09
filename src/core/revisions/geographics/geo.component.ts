import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITag,ILocation,IGeographic, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shelter/shelterPage/shared.service';
import { Subscription } from 'rxjs/Subscription';

let stringValidator=/^([A-Za-z0-99À-ÿ� ,.:/';!?|)(_-]*)*$/;
let telephoneValidator=/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
let mailValidator=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let numberValidator=/^[0-9]+[.]{0,1}[0-9]*$/;
let urlValidator=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

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
    disableSave=false;
    activeComponentSub:Subscription;
    maskSaveSub:Subscription;
    tagChange:boolean=false
    displayError:boolean=false;
    maskInvalidSub:Subscription;
    maskValidSub:Subscription;
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
        this.geoForm = fb.group({
            region:["",[Validators.required,Validators.pattern(stringValidator)]],//required and string
            province:["",Validators.pattern(stringValidator)],//string with some character
            municipality:["",Validators.pattern(stringValidator)],
            locality:["",Validators.pattern(stringValidator)],
            ownerRegion:["",Validators.pattern(stringValidator)],
            authorityJurisdiction:["",Validators.pattern(stringValidator)],
            altitude:["",Validators.pattern(numberValidator)],//number
            latitude:["",Validators.pattern(numberValidator)],
            longitude:["",Validators.pattern(numberValidator)],
            massif:["",Validators.pattern(stringValidator)],
            valley:["",Validators.pattern(stringValidator)],
            tags:fb.array([]),
            newKey:["Chiave",[Validators.pattern(stringValidator),Validators.required]],
            newValue:["Valore",[Validators.pattern(stringValidator),Validators.required]]
        }); 

        this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
            this.displayError=true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(()=>{
            if(this.geoForm.valid){
                this.displayError=false;
            }
        });

        shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            this.disableSave=true;
            this.save(true);
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
            key:[key,Validators.pattern(stringValidator)],
            value: [value,Validators.pattern(stringValidator)]
        });
    }

    save(confirm){
        if(this.geoForm.valid){
            let shelter:IShelter={_id:this._id,name:this.name,geoData:{location:this.data.location}};
            let location:ILocation={
                region:this.geoForm.controls.region.value||null,
                province:this.geoForm.controls.province.value||null,
                municipality:this.geoForm.controls.municipality.value||null,
                locality:this.geoForm.controls.locality.value||null,
                ownerRegion:this.geoForm.controls.ownerRegion.value||null,
                authorityJurisdiction:this.geoForm.controls.authorityJurisdiction.value||null,
                altitude:this.geoForm.controls.altitude.value||null,
                latitude:this.geoForm.controls.latitude.value||null,
                longitude:this.geoForm.controls.longitude.value||null,
                massif:this.geoForm.controls.massif.value||null,
                valley:this.geoForm.controls.valley.value||null
            }
            const control = (<FormArray>this.geoForm.controls['tags']).controls;
            let tags:ITag[]=[];
            for(let c of control){
                tags.push({key:c.value.key,value:c.value.value});
            }
            shelter.geoData.tags=tags as [ITag];
            shelter.geoData.location=location;
            this.revisionService.onChildSave(shelter,"geoData");
            let shelSub=this.shelterService.preventiveUpdateShelter(shelter,"geoData").subscribe((returnVal)=>{
                if(returnVal){
                    this.displayError=false;
                    if(confirm){
                        this.shared.onMaskConfirmSave("geographic");
                    }
                }else{
                    console.log("Err "+returnVal);
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
            if(!this.disableSave)
                this.save(false);
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
        if(this.activeComponentSub!=undefined){
            this.activeComponentSub.unsubscribe();
        }
        if(this.maskInvalidSub!=undefined){
            this.maskInvalidSub.unsubscribe();
        }
        if(this.maskValidSub!=undefined){
            this.maskValidSub.unsubscribe();
        }
        
    }

    getGeoData(id):Promise<IShelter>{
        return new Promise<IShelter>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.geoData!=undefined){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                }else{
                    let shelSub=this.shelterService.getShelterSection(id,"geoData").subscribe(shelter=>{
                        this.revisionService.onChildSave(shelter,"geoData");
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
            this.revisionService.onChildLoadRequest("geoData");
        });
     }

    ngOnInit(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.getGeoData(params["id"])
            .then((shelter)=>{
                this.initForm(shelter);
                if(routeSub!=undefined){
                    routeSub.unsubscribe();
                }
            });
        });

    }
}