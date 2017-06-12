import {
  Component,Input,OnInit
} from '@angular/core';
import { IService } from '../../../shared/interfaces'

@Component({
  moduleId: module.id,
  selector: 'bc-serv-item',
  templateUrl: 'serv-item.component.html',
  styleUrls: ['serv-item.component.scss'],

})
export class BcServItem {
  @Input() item:IService;
}