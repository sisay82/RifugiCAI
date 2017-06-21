import {
    Input,
    ElementRef,
    Renderer2
} from '@angular/core';
import { PropertyResolver } from './property-resolver'

export class BcStyler {
    /** @hidden */
    private _elementRef: ElementRef;

    /** @hidden */
    private _renderer: Renderer2;

    /** @hidden */
    private _color: string;
    
    /** @hidden */
    private _element: any = null;

    constructor(elementRef: ElementRef, renderer: Renderer2) {
        this._elementRef = elementRef;
        this._renderer = renderer;
        this._element = this._elementRef != null ? this._elementRef.nativeElement : null;
    }

    /** The color of the navbar. Can be primary, accent, or warn. */
    @Input()
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        let newClassName: string = (value != null && value != '') ? `bc-${value}` : null;
        this.updateClass("_color", newClassName);
    }

    public updateClass(propertyName: string, newClass: string) {
        if (propertyName != null && propertyName != '') {
            let propertyResolved = PropertyResolver.resolve(propertyName, this);
            this._setElementClass(propertyResolved, false);
            this._setElementClass(newClass, true);
            propertyResolved = newClass;
        }
    }

    /** @hidden */
    private _setElementClass(className: string, isAdd: boolean) {
        if (this._element != null && className != null && className != '') {
            if (isAdd) {
                this._renderer.addClass(this._element, className);
            } else {
                this._renderer.removeClass(this._element, className);
            }
        }
    }

    /** @hidden */
    private _setElementAttribute(attributeName: string, attributeValue: any, isAdd: boolean) {
        if (this._element != null && attributeName != null && attributeName != '') {
            if (isAdd) {
                this._renderer.setAttribute(this._element, attributeName, attributeValue);
            } else {
                this._renderer.removeAttribute(this._element, attributeName);
            }
        }
    }

    /** @hidden */
    private setElementStyle(style: string, value: string, isAdd: boolean) {
        if (this._element != null && style != null && style != '') {
            if (isAdd) {
                this._renderer.setStyle(this._element, style, value);
            } else {
                this._renderer.removeStyle(this._element, style);
            }
        }
    }

    /** @hidden */
    private _getElementRef(): ElementRef {
        return this._elementRef;
    }

    /** @hidden */
    private _getNativeElement(): any {
        return this._elementRef.nativeElement;
    }
}