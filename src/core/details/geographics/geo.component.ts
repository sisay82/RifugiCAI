import {
  Component,Input
} from '@angular/core';
import { IShelter } from '../../../shared/interfaces'

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
})
export class BcGeo {
  @Input() data:IShelter;

  constructor(){}

  getCenter(){
    if(this.data!=undefined && this.data.geographic_data!=undefined && this.data.geographic_data.coordinates!=undefined){
      return [this.data.geographic_data.coordinates.latitude,this.data.geographic_data.coordinates.longitude];
    }else{
      return [41.9051,12.4879];//default
    }
  }

}