import {
  Component,Input,OnInit,Pipe, PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic } from '../../../app/shared/types/interfaces'
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
    geoForm: FormGroup; 
    data:IGeographic;
    constructor(private shelterService:ShelterService,private _route:ActivatedRoute,fb: FormBuilder) { 
        this.geoForm = fb.group({
            region:["",Validators.required],
            province:[],
            municipality:[],
            locality:[],
            ownerRegion:[],
            authorityJurisdiction:[],
            altitude:[],
            latitude:[],
            longitude:[],
            massif:[],
            valley:[]
        }); 
    } 

    click(){

    }

    ngOnInit(){
        this._route.parent.params.subscribe(params=>{
            this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
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