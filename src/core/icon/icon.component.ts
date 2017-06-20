import {
    Component,
    Input,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    ElementRef,
    Renderer2,
} from '@angular/core';

import { HtmlStyler } from '../shared/types/html-styler';

@Component({
    moduleId: module.id,
    selector: 'bc-icon',
    templateUrl: 'icon.component.html',
    styleUrls: ['icon.component.scss'],
    host: {
        '[class.bc-icon]': 'true',
        '[class.fa]': 'true',
        'role': 'img'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BcIcon {
    private _HtmlStyler: HtmlStyler;
    private _name: string;
    private _color: string;
    private _size: string;

    constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
        this._HtmlStyler = new HtmlStyler(this, _elementRef, _renderer);
    }

    /** The name of the icon.*/
    @Input()
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        let newClassName: string = (value != null && value != '') ? `fa-${value}` : null;
        this._HtmlStyler.updateClass("_name", newClassName);
    }

    /** The color of the icon. Can be primary, accent, or warn. */
    @Input()
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        let newClassName: string = (value != null && value != '') ? `bc-${value}` : null;
        this._HtmlStyler.updateClass("_color", newClassName);
    }

    /** The size of the icon. Can be xs, s, m, l, or xl. */
    @Input()
    get size(): string {
        return this._size;
    }

    set size(value: string) {
        let newClassName: string = (value != null && value != '') ? `bc-icon-${value}` : null;
        this._HtmlStyler.updateClass("_color", newClassName);
    }
}