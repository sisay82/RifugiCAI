import {
  Component,
  ElementRef,
  Renderer2,
  Input,
  ViewEncapsulation
} from '@angular/core';

import { HtmlStyler } from '../shared/types/html-styler';

@Component({
  selector: '[bc-avatar]',
  styleUrls: ['avatar.component.scss'],
  template: '',
  host: {
    '[class.bc-avatar]': 'true'
  },
  encapsulation: ViewEncapsulation.None
})
export class BcAvatar {
  private _HtmlStyler: HtmlStyler;
  private _shape: string;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._HtmlStyler = new HtmlStyler(this, _elementRef, _renderer);
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

    this._HtmlStyler.updateClass("_shape", className);
  }
}