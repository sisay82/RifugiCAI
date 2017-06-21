import {
  Component,
  ElementRef,
  Renderer2,
  Input,
  ViewEncapsulation
} from '@angular/core';

import { BcStyler } from '../shared/types/bc-styler';

@Component({
  selector: '[bc-avatar]',
  styleUrls: ['avatar.component.scss'],
  template: '',
  host: {
    '[class.bc-avatar]': 'true'
  },
  encapsulation: ViewEncapsulation.None
})
export class BcAvatar extends BcStyler {
  private _shape: string;

  constructor(elementRef: ElementRef, renderer: Renderer2) {
    super(elementRef, renderer);
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