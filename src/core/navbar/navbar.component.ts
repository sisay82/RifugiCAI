import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewEncapsulation,
    Directive,
    ElementRef,
    Renderer2,
} from '@angular/core';


@Directive({
    selector: 'bc-navbar-row',
    host: {
        '[class.bc-navbar-row]': 'true',
    },
})
export class BcNavbarRow { }

@Component({
    moduleId: module.id,
    selector: 'bc-navbar',
    templateUrl: 'navbar.component.html',
    styleUrls: ['navbar.component.scss'],
    host: {
        '[class.bc-navbar]': 'true',
        'role': 'navbar'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BcNavbar {

    private _color: string;
    private _fixed: string;

    constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    }

    /** The color of the navbar. Can be primary, accent, or warn. */
    @Input()
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._updateClass(this._elementRef.nativeElement, "_color", value);
    }

    @Input()
    get fixed(): string {
        return this._fixed;
    }

    set fixed(value: string) {
        this._updateClass(this._elementRef.nativeElement, "_fixed", "fixed-" + value);
        this._updateClass(this._elementRef.nativeElement.parentElement, "_fixed", "navbar-container-"+value);
    }

    private _updateClass(element: any, propertyName: string, newClassValue: string) {
        if (propertyName != null && propertyName != '') {
            this._setElementClass(element, this[propertyName], false);
            this._setElementClass(element, newClassValue, true);
            this[propertyName] = newClassValue;
        }
    }

    private _setElementClass(element: any, value: string, isAdd: boolean) {
        if (element != null && value != null && value != '') {
            if (isAdd) {
                this._renderer.addClass(element, `bc-${value}`);
            } else {
                this._renderer.removeClass(element, `bc-${value}`);
            }
        }
    }

}