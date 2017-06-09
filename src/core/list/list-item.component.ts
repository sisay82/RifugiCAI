
import {
    Component,
    ViewEncapsulation,
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

@Component({
    moduleId: module.id,
    selector: 'bc-list-item, a[bc-list-item], button[bc-list-item]',
    host: {
        'role': 'listitem',
        '(click)': 'selected($event)',
        '[class.bc-list-item]': 'true',
        '[class.list-group-item]': 'true',
        '[class.active]': 'active'
    },
    templateUrl: 'list-item.component.html',
    // providers: [ItemSelectionService],
    encapsulation: ViewEncapsulation.None
})
export class BcListItem {
    readonly listItemId: number;
    public listItemUniqueName: string;
    public active: boolean = false;

    constructor(private _SelectionService: ItemSelectionService) {
        this.listItemId = _nextListItemId++;
    }

    selected(event: any): void {
        this._SelectionService.selectionChange(this.listItemUniqueName);
    }
    
}