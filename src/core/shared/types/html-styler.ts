import {
    ElementRef,
    Renderer2
} from '@angular/core';
import { PropertyResolver } from './property-resolver'

export class HtmlStyler {
    private element: any = null;
    
    constructor(private _elementComponent: any, private _elementRef: ElementRef, private _renderer: Renderer2) {
        this.element = _elementRef != null ? _elementRef.nativeElement : null;
    }

    public updateClass(propertyName: string, newClass: string) {
        if (propertyName != null && propertyName != '') {
            let propertyResolved = PropertyResolver.resolve(propertyName, this._elementComponent)
            this._setElementClass(propertyResolved, false);
            this._setElementClass(newClass, true);
            propertyResolved = newClass;
        }
    }

    private _setElementClass(className: string, isAdd: boolean) {
        if (this.element != null && className != null && className != '') {
            if (isAdd) {
                this._renderer.addClass(this.element, className);
            } else {
                this._renderer.removeClass(this.element, className);
            }
        }
    }
}