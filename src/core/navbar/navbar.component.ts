import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewEncapsulation,
    Directive,
    ElementRef,
    Renderer2,
} from '@angular/core';

import { HtmlStyler } from '../shared/types/html-styler';

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
    private _HtmlStyler: HtmlStyler;
    private _color: string;

    constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
        this._HtmlStyler = new HtmlStyler(this, _elementRef, _renderer);
    }

    /** The color of the navbar. Can be primary, accent, or warn. */
    @Input()
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        let newClassName: string = (value != null && value != '') ? `bc-${value}` : null;
        this._HtmlStyler.updateClass("_color", newClassName);
    }
}