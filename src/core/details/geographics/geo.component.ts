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

}