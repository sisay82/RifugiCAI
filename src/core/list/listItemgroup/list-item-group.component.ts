import {
  Component,
  ElementRef,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';

import { BcStyler } from '../../shared/types/bc-styler';

let _nextListGroupId = 0;

@Component({
  moduleId: module.id,
  selector: 'bc-list-item-group',
  host: {
    'role': 'region',
    '[class.bc-list-item-group]': 'true',
  },
  templateUrl: 'list-item-group.component.html',
  styleUrls: ['list-item-group.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BcListItemGroup extends BcStyler {
  private _listIdGroup: number;
 
  constructor(elementRef: ElementRef, _renderer2: Renderer2) {
    super(elementRef, _renderer2);
    this._listIdGroup = _nextListGroupId++;
  }
}
