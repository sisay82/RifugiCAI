
import {
  Component,
  ViewEncapsulation,
  Directive,
  ContentChildren,
  AfterContentInit,
  QueryList
} from '@angular/core';

import { BcListItem, ItemSelectionService } from './list-item.component';

import { Subscription } from 'rxjs/Subscription';

let _nextListId = 0;

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
  selector: 'bc-list',
  host: {
    '[class.list-group]': 'true'
  }
})
export class BcListStyler { }

@Component({
  moduleId: module.id,
  selector: 'bc-list',
  host: {
    'role': 'list',
    '[class.bc-list]': 'true',
  },
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.scss'],
  providers: [ItemSelectionService],
  encapsulation: ViewEncapsulation.None
})
export class BcList {
  private _listId: number;
  private _subcription: Subscription;

  constructor(private _SelectionService: ItemSelectionService) {
    this._listId = _nextListId++;
    this._subcription = _SelectionService.selection$.subscribe(uniqueName => {
      this._listItems.forEach((item: BcListItem) => {
        item.active = item.listItemUniqueName === uniqueName;
      });
    });
  }

  @ContentChildren(BcListItem) _listItems: QueryList<BcListItem>;

  ngAfterContentInit(): void {
    this._listItems.forEach((item: BcListItem) => {
      item.listItemUniqueName = this.getListItemUniqueName(item);
    });

    this._listItems.changes.subscribe((item: BcListItem) => {
      this.getListItemUniqueName(item);
    });
  }

  private getListItemUniqueName(item: BcListItem) {
    return "bc-list-" + this._listId + '-' + item.listItemId;
  }
}
