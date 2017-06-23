import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic } from '../../../app/shared/types/interfaces'
import {BcMap} from '../../map/map.component';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Subject } from 'rxjs/Subject';

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeo {
  data:IGeographic={location:{longitude:null,latitude:null}};
  center:Subject<L.LatLng|L.LatLngExpression>=new Subject();

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}

  getCenter(){
    if(this.data!=undefined && this.data.location!=undefined
    &&this.data.location.latitude!=undefined&&this.data.location.longitude!=undefined){
      return [this.data.location.latitude,this.data.location.longitude];
    }else{
      return BcMap.defaultCenter;//default
    }
  }

  getZoom(){
    if(this.data!=undefined && this.data.location!=undefined){
      return 11;
    }else{
      return 6;//default
    }
  }

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
        this.data=shelter.geoData;
        this.center.next([shelter.geoData.location.latitude as number,shelter.geoData.location.longitude as number]);
      });
    });
  }

  getTag(key:String){
    if(this.data!=undefined && this.data.tags!=undefined){
      let index=this.data.tags.findIndex((tag)=>tag.key==key)
      if(index>-1){
        return this.data.tags[index].value;
      }else{
        return '----';
      }
    }else{
      return '----';
    } 
  }
}