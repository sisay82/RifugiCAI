import {
  Component,
  ElementRef,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';

import { BcStyler } from '../shared/types/bc-styler';

@Component({
  moduleId: module.id,
  selector: 'bc-menu',
  host: {
    'role': 'navigation',
    '[class.bc-menu]': 'true',
    '[class.left]': 'true'
  },
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BcMenu extends BcStyler {
  constructor(elementRef: ElementRef, _renderer2: Renderer2) {
    super(elementRef, _renderer2);
  }
}
