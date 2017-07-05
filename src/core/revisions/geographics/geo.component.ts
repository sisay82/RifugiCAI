import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';

@Component({
  moduleId: module.id,
  selector: 'bc-geo-revision',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeoRevision {
    clickButton:IButton={text:"Invia",action:this.click,ref:this};
    _id:String;
    name:String;
    geoForm: FormGroup; 
    data:IGeographic;
    invalid:Boolean=false;
    displaySave:Boolean=false;
    displayError:boolean=false;
    constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
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
            tags:fb.array([
                
            ]),
            newKey:["Chiave",[Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/),Validators.required]],
            newValue:["Valore",[Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)+$/),Validators.required]]
        }); 
    } 

    addTag(key:String,value:String){
        const control = <FormArray>this.geoForm.controls['tags'];
        control.push(this.initTag(key,value));
    }

    removeTag(index){
        const control = <FormArray>this.geoForm.controls['tags'];
        control.removeAt(index);
    }

    addNewTag(key:String,value:String){
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

    click(ref:any){
        let shelter:any={_id:ref._id,name:ref.name,geoData:{location:ref.data.location}};
        for(let prop in ref.geoForm.controls){
            if(ref.geoForm.controls[prop].dirty){
                shelter.geoData.location[prop]=ref.geoForm.controls[prop].value;
            }
        }
        const control = <FormArray>ref.geoForm.controls['tags'];
        let tags:any[]=[];
        for(let c of control.controls){
            tags.push({key:c.value.key,value:c.value.value});
        }
        shelter.geoData.tags=tags;
        ref.revisionService.onChildSave(shelter,"geoData");
        ref.shelterService.preventiveUpdateShelter(shelter,"geoData").subscribe((returnVal)=>{
            if(returnVal){
                ref.displaySave=true;
                ref.displayError=false;
                //location.reload();
            }else{
                console.log("Err "+returnVal);
                ref.displayError=true;
                ref.displaySave=false;
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
        if(this.geoForm.dirty){
            this.click(this);
        }
        
    }

    ngOnInit(){
        this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.geoData!=undefined){
                    this.initForm(shelter);
                }else{
                    this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
                        this.initForm(shelter);
                    });
                }

            });
            this.revisionService.onChildLoadRequest("geoData");
        });

    }
}