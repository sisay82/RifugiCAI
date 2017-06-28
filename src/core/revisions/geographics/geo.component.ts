import {
  Component,Input,OnInit,Pipe, PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, Validators } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any[] {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, val: value[key]});
    }
    return keys;
  }
}

@Component({
  moduleId: module.id,
  selector: 'bc-geo-revision',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeoRevision {
    clickButton:IButton={text:"Invia.",action:this.click,ref:this};
    _id:String;
    name:String;
    geoForm: FormGroup; 
    data:IGeographic;
    constructor(private shelterService:ShelterService,private _route:ActivatedRoute,fb: FormBuilder) { 
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
            valley:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]
        }); 
    } 

    click(ref:any){
        let shelter:IShelter={_id:ref._id,name:ref.name,geoData:ref.data};
        for(let prop in ref.data.location){
            if(ref.data.location.hasOwnProperty(prop)){
                if(ref.geoForm.contains(prop)&&ref.geoForm.controls[prop].dirty){
                    shelter.geoData.location[prop]=ref.geoForm.controls[prop].value;
                }
            }
        }
        ref.shelterService.updateShelter(shelter).subscribe((returnVal)=>{
            location.reload();
        });
    }

    ngOnInit(){
        this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
                this.name=shelter.name;
                this.data=shelter.geoData;

                if(this.data!=undefined&&this.data.location!=undefined){
                    for(let prop in this.data.location){
                        if(this.data.location.hasOwnProperty(prop)){
                            if(this.geoForm.contains(prop)){
                                this.geoForm.controls[prop].setValue(this.data.location[prop]);
                                this.geoForm.controls[prop].markAsTouched();
                            }
                        }
                    }
                }
                
            });
        });
    }
}