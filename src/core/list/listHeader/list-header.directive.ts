import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
} from '@angular/core';

import { BcStyler } from '../../shared/types/bc-styler';

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
  selector: 'bc-list-header',
  host: {
    '[class.bc-list-header]': 'true',
    '[class.bc-list-header-text]': 'true',
  }
})
export class BcListHeader extends BcStyler { 
    constructor(elementRef: ElementRef, _renderer2: Renderer2) {
    super(elementRef, _renderer2);
  }
}