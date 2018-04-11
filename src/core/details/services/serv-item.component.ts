import {
  Component, Input, OnInit
} from '@angular/core';
import { IService, ITag } from '../../../app/shared/types/interfaces'

@Component({
  moduleId: module.id,
  selector: 'bc-serv-item',
  templateUrl: 'serv-item.component.html',
})
export class BcServItem {
  @Input() item: IService;
  options: ITag[] = [];
}
