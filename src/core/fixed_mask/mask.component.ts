import {
  Component, Input
} from '@angular/core';
/*import { IShelter } from '../../shared/interfaces'*/

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask.component.html',
    styleUrls: ['mask.component.scss']
})
export class BcMask {
  @Input() shelter;

  constructor(){
    this.shelter={
      name:"Nome Rifugio",
      collective:"Comune Rifugio",
      id:"---",
      type:"---",
      section:"---",
      property:"---",
      category:"---",
      to_region:"---",
      insert_date:"---",
      update_date:"---"
    }
  }
}