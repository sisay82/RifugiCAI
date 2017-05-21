import {
  Component,
  ElementRef,
  Renderer2,
  Input
} from '@angular/core';

@Component({
  selector: '[bc-avatar]',
  styleUrls: ['avatar.directive.scss'],
  template: '',
  host: {
    '[class.bc-avatar]': 'true'
  }
})
export class BcAvatar {

  private _shape: string;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
  }

  /** The shape of the avatar. Can be round, square, or rounded-corner. */
  @Input("bc-avatar")
  set in(value: string) {
    var className: string;
    switch (`${value}`.toUpperCase()) {
      case "SQUARE":
        className = "";
      case "ROUNDED-CORNER":
        className = "img-rounded";
      default:
        className = "img-circle";
    }

    this._updateClass(this._elementRef.nativeElement, "_shape", className);
  }

  private _updateClass(element: any, propertyName: string, newClass: string) {
    if (propertyName != null && propertyName != '') {
      this._setElementClass(element, this[propertyName], false);
      this._setElementClass(element, newClass, true);
      this[propertyName] = newClass;
    }
  }

  private _setElementClass(element: any, className: string, isAdd: boolean) {
    if (element != null && className != null && className != '') {
      if (isAdd) {
        this._renderer.addClass(element, className);
      } else {
        this._renderer.removeClass(element, className);
      }
    }
  }

}