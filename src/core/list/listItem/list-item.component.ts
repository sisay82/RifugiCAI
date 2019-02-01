import {
    Component,
    Directive,
    Input,
    Injectable,
    ElementRef,
    Renderer2,
    ViewEncapsulation,
    ContentChildren,
    QueryList,
    OnDestroy,
    AfterContentInit,
    AfterViewInit
} from '@angular/core';

import { Subscription, Subject } from 'rxjs';

import { BcStyler } from '../../shared/types/bc-styler';

let _nextListItemId = 0;

@Injectable()
export class ListItemService {
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
    private _DisableItem: boolean;
    @Input('bc-disable-item')
    set disableItem(value: string) {
        this._DisableItem = value === "true";
    }
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
        '[class.active]': 'isNavItem && active'
    },
    templateUrl: 'list-item.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BcListItem extends BcStyler implements OnDestroy, AfterContentInit, AfterViewInit {
    readonly listItemId: number;
    private _linesSubcription: Subscription;
    private isNavItem: boolean = false;
    private _linesClass: string;
    @ContentChildren(BcLineStyler) _lines: QueryList<BcListItem>;
    public listItemUniqueName: string;
    public active = false;

    constructor(private elementRef: ElementRef, _renderer2: Renderer2, private _ListItemService: ListItemService) {
        super(elementRef, _renderer2);

        this.listItemId = _nextListItemId++;
    }


    ngAfterContentInit(): void {
        const newClassName: string = this._lines.length > 1 ? "bc-multi-line" : null;
        this.updateClass("_linesClass", newClassName);
        this._linesSubcription = this._lines.changes.subscribe((lines) => {
            const newClassN: string = this._lines.length > 1 ? "bc-multi-line" : null;
            this.updateClass("_linesClass", newClassN);
        });
    }

    ngAfterViewInit(): void {
        this.isNavItem = this.elementRef.nativeElement.attributes["bc-nav-item"] !== undefined;
    }

    selected(event: any): void {
        this._ListItemService.selectionChange(this.listItemUniqueName);
    }

    ngOnDestroy(): void {
        this._linesSubcription.unsubscribe();
    }

}