
import {
  Component,
  Directive,
  ViewEncapsulation,
  ContentChildren,
  AfterContentInit,
  QueryList,
  IterableDiffer,
  IterableDiffers,
  CollectionChangeRecord,
} from '@angular/core';

import { BcListItem, ItemSelectionService } from './listItem/list-item.component';

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
  private _differ: IterableDiffer<any>;
  private _listId: number;
  private _subcription: Subscription;

  constructor(private _SelectionService: ItemSelectionService, private _differs: IterableDiffers) {
    this._listId = _nextListId++;
    this._subcription = _SelectionService.selection$.subscribe(uniqueName => {
      this._listItems.forEach((item: BcListItem) => {
        item.active = item.listItemUniqueName === uniqueName;
      });
    });
    this._differ = this._differs.find([]).create(null);
  }

  @ContentChildren(BcListItem) _listItems: QueryList<BcListItem>;

  ngAfterContentInit(): void {
    this._listItems.forEach((item: BcListItem) => {
      item.listItemUniqueName = this.getListItemUniqueName(item);
    });

    this._listItems.changes.subscribe((items) => {
      let changeDiff = this._differ.diff(items);
      if (changeDiff) {
        changeDiff.forEachAddedItem((changeRecord: CollectionChangeRecord<BcListItem>) => { // added item
          changeRecord.item.listItemUniqueName = this.getListItemUniqueName(changeRecord.item);
        });
        changeDiff.forEachRemovedItem((item: CollectionChangeRecord<BcListItem>) => {
          // removed item
          console.log('Removed BcListItem!!!');
        });
      }
    });
  }

  private getListItemUniqueName(item: BcListItem) {
    return "bc-list-" + this._listId + '-' + item.listItemId;
  }
}
