import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewEncapsulation,
    Directive,
    ElementRef,
    Renderer2,
} from '@angular/core';

import { BcStyler } from '../shared/types/bc-styler';

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
export class BcNavbar extends BcStyler {
    constructor(elementRef: ElementRef, _renderer2: Renderer2) {
        super(elementRef, _renderer2);
    }
}