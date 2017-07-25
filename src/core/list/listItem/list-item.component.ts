import {
    Component,
    Directive,
    Input,
    ViewEncapsulation,
    ElementRef,
    Renderer2,
    Injectable
} from '@angular/core';

import { Subject } from 'rxjs/Subject';

let _nextListItemId: number = 0;

@Injectable()
export class ItemSelectionService {
    // Observable string sources
    private _SelctionsSource = new Subject<string>();
    // Observable string streams
    selection$ = this._SelctionsSource.asObservable();

    selectionChange(listItemUniqueName: string): void {
        this._SelctionsSource.next(listItemUniqueName);
    }
}

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
    selector: 'a[bc-list-item], button[bc-list-item]',
    host: {
        '[attr.bc-nav-item]': 'true'
    }
})
export class BcListNavItemStyler {
}

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
    selector: 'a[bc-list-item][bc-disable-item], button[bc-list-item][bc-disable-item]',
    host: {
        '[class.disabled]': '_DisableItem'
    }
})
export class BcListItemDisableStyler {
    @Input('bc-disable-item') _DisableItem: boolean;
}

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
    selector: '[bc-line], [data-bc-line]',
    host: {
        '[class.bc-line]': 'true'
    }
})
export class BcLineStyler {
}

@Component({
    moduleId: module.id,
    selector: 'bc-list-item, a[bc-list-item], button[bc-list-item]',
    host: {
        'role': 'listitem',
        '(click)': 'selected($event)',
        '[class.bc-list-item]': 'true',
        '[class.list-group-item]': 'true',
        //'[class.active]': 'isNavItem && active'
    },
    templateUrl: 'list-item.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BcListItem {
    readonly listItemId: number;
    private isNavItem: boolean = false;
    public listItemUniqueName: string;
    public active: boolean = false;

    constructor(private _ElementRef: ElementRef, private _Renderer2: Renderer2, private _SelectionService: ItemSelectionService) {
        this.listItemId = _nextListItemId++;
    }

    ngAfterViewInit() {
        this.isNavItem = this._ElementRef.nativeElement.attributes["bc-nav-item"] !== undefined;
    }

    selected(event: any): void {
        this._SelectionService.selectionChange(this.listItemUniqueName);
    }

}