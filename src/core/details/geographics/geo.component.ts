import {
  Component,Input
} from '@angular/core';
import { IShelter } from '../../../shared/interfaces'
import {BcMap} from '../../map/map.component';

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
})
export class BcGeo {
  @Input() data:IShelter;

  constructor(){
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

}