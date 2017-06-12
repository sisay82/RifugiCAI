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

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}

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
      this.data={name:params['name'],
                registry:this.shelterService.getHeaderByName(params['name']),
                geographic_data:this.shelterService.getGeographicByName(params['name'])
              };

    });
  }

}