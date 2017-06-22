import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter } from '../../../app/shared/types/interfaces'
import {BcMap} from '../../map/map.component';
import {ShelterService} from '../../../app/shelter/shelter.service'

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeo {
  data:IShelter;

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}

  getCenter(){
    if(this.data!=undefined && this.data.geoData!=undefined && this.data.geoData.location!=undefined){
      return [this.data.geoData.location.latitude,this.data.geoData.location.longitude];
    }else{
      return BcMap.defaultCenter;//default
    }
  }

  getZoom(){
    if(this.data!=undefined && this.data.geoData!=undefined && this.data.geoData.location!=undefined){
      return 11;
    }else{
      return 6;//default
    }
  }

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
        this.data=shelter;
      });
    });
  }

  getTag(key:String){
    if(this.data!=undefined && this.data.geoData!=undefined && this.data.geoData.tags!=undefined){
      let index=this.data.geoData.tags.findIndex((tag)=>tag.key==key)
      if(index>-1){
        return this.data.geoData.tags[index].value;
      }else{
        return null;
      }
    }else{
      return null;
    } 
  }
}