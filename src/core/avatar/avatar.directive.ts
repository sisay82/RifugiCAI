import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
} from '@angular/core';

import { BcStyler } from '../shared/types/bc-styler';

@Directive({
  selector: '[bc-avatar]',
  host: {
    '[class.bc-avatar]': 'true'
  }
})
export class BcAvatar extends BcStyler {
  private _shape: string;

  constructor(elementRef: ElementRef, _renderer2: Renderer2) {
    super(elementRef, _renderer2);
  }

  /** The shape of the avatar. Can be round, square, or rounded-corner. */
  @Input("bc-avatar")
  set in(value: string) {
    var className: string;
    switch (`${value}`.toLowerCase()) {
      case "square":
        className = "";
        break;
      case "rounded-corner":
        className = "img-rounded";
        break;
      default:
        className = "img-circle";
    }

    this.updateClass("_shape", className);
  }
}