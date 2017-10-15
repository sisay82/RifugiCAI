import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
} from '@angular/core';

import { BcStyler } from '../shared/types/bc-styler';

@Component({
  selector: '[bc-button],[data-bc-button]',
  templateUrl: 'button.component.html',
  host: {
    'role': '_role',
    '[class.bc-button]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BcButton extends BcStyler {
  /** @hidden */
  _role: string = 'button'; // bar-button

  /** @hidden */
  _size: string; // large/small/default

  /** @hidden */
  _type: string = 'default'; // outline/clear/solid

  /** @hidden */
  _shape: string; // round/fab

  /** @hidden */
  _display: string; // block/full

  /** @hidden */
  _decorator: string; // strong

  constructor(elementRef: ElementRef, _renderer2: Renderer2) {
    super(elementRef, _renderer2);
  }


  /** The size of the button. Can be sm, md, lg or default. The default value is md  */
  @Input()
  set size(value: string) {
    let newClassName: string = (value != null && value != '' && value.toLowerCase() != 'default') ? `bc-${value}` : null;
    this.updateClass("_size", newClassName);
  }

  get size(): string {
    return this._size;
  }

  /** The type of the button. Can be outline, solid, clear or default. The default value is solid  */
  @Input()
  set type(value: string) {
    let newClassName: string = (value != null && value != '' && value.toLowerCase() != 'default') ? `bc-${value}` : null;
    this.updateClass("_type", newClassName);
  }

  /** The size of the button. Can be round or fab. The default value is squared  */
  @Input()
  set shape(value: string) {
    let newClassName: string = (value != null && value != '') ? `btn-${value}` : null;
    this.updateClass("_shape", newClassName);
  }

  get shape(): string {
    return this._shape;
  }

}