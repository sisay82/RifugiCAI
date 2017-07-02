import {
  Component,
  Directive,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  ContentChild,
  ContentChildren,
  AfterContentInit,
  QueryList,
  IterableDiffer,
  IterableDiffers,
  CollectionChangeRecord,
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { BcStyler } from '../shared/types/bc-styler';

import { BcListItem, ItemSelectionService } from './listItem/list-item.component';

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

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
  selector: '[bc-avatar]',
  host: {
    '[class.bc-list-item-avatar]': 'true'
  }
})
export class BcListAvatarStyler { }

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
export class BcList extends BcStyler {
  private _listId: number;
  private _differ: IterableDiffer<any>;
  private _subcription: Subscription;
  private _avatar: string;

  constructor(elementRef: ElementRef, renderer: Renderer2, private _SelectionService: ItemSelectionService, private _differs: IterableDiffers) {
    super(elementRef, renderer);
    this._listId = _nextListId++;

    this._subcription = _SelectionService.selection$.subscribe(uniqueName => {
      this._listItems.forEach((item: BcListItem) => {
        item.active = item.listItemUniqueName === uniqueName;
      });
    });

    this._differ = this._differs.find([]).create(null);
  }

  @ContentChild(BcListAvatarStyler)
  set avatar(value: BcListAvatarStyler) {
    let newClassName: string = (value != null) ? "bc-list-avatar" : null;
    this.updateClass("_avatar", newClassName);
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
