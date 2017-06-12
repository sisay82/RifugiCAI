import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter } from '../../../shared/interfaces'
import {BcMap} from '../../map/map.component';
import {ShelterService} from '../../shelter/shelter.service'

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeo {
  data:IShelter;

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){
    this.data={id:"id3",name:"Shelter3",geographic_data:{coordinates:{latitude:43.14,longitude:11.42}}, registry:{address:{via:"via",number:1,cap:1,city:"city",collective:"Comune1",country:"Regione1",district:"Provincia1"}}};
  }

  getCenter(){
    if(this.data!=undefined && this.data.geographic_data!=undefined && this.data.geographic_data.coordinates!=undefined){
      return [this.data.geographic_data.coordinates.latitude,this.data.geographic_data.coordinates.longitude];
    }else{
      return BcMap.defaultCenter;//default
    }
  }

  getZoom(){
    if(this.data!=undefined && this.data.geographic_data!=undefined && this.data.geographic_data.coordinates!=undefined){
      return 11;
    }else{
      return 6;//default
    }
  }

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.data=this.shelterService.getByName(params['name']);
    });
  }

}