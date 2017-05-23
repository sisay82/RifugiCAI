
import {
    Component,
    ViewEncapsulation
} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'bc-list-item, a[bc-list-item], button[bc-list-item]',
    host: {
        'role': 'listitem',
        '(focus)': '_handleFocus()',
        '(blur)': '_handleBlur()',
        '[class.list-group-item]': 'true',
    },
    templateUrl: 'list-item.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BcListItem {

    _hasFocus: boolean = false;

    _handleFocus() {
        this._hasFocus = true;
    }

    _handleBlur() {
        this._hasFocus = false;
    }
}