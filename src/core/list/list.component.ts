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
  OnDestroy
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { BcStyler } from '../shared/types/bc-styler';

import { BcListItem, ListItemService } from './listItem/list-item.component';

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

/**
 * Directive whose purpose is to add the bc- CSS styling to this selector.
 */
@Directive({
  selector: '[bc-thumbnail]',
  host: {
    '[class.bc-list-item-thumbnail]': 'true'
  }
})
export class BcListThumbnailStyler { }

@Component({
  moduleId: module.id,
  selector: 'bc-list',
  host: {
    'role': 'list',
    '[class.bc-list]': 'true',
  },
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.scss'],
  providers: [ListItemService],
  encapsulation: ViewEncapsulation.None
})
export class BcList extends BcStyler implements OnDestroy {
  private _listId: number;
  private _differ: IterableDiffer<any>;
  private _listItemSubcription: Subscription;
  private _selectionSubcription: Subscription;
  private _avatar: string;
  private _thumbnail: string;

  constructor(elementRef: ElementRef, _renderer2: Renderer2, private _ListItemService: ListItemService, private _differs: IterableDiffers) {
    super(elementRef, _renderer2);
    this._listId = _nextListId++;

    this._selectionSubcription = _ListItemService.selection$.subscribe(uniqueName => {
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

  @ContentChild(BcListThumbnailStyler)
  set thumbnail(value: BcListThumbnailStyler) {
    let newClassName: string = (value != null) ? "bc-list-thumbnail" : null;
    this.updateClass("_thumbnail", newClassName);
  }

  @ContentChildren(BcListItem, {descendants: true}) _listItems: QueryList<BcListItem>;

  ngAfterContentInit(): void {
    this._listItems.forEach((item: BcListItem) => {
      item.listItemUniqueName = this.getListItemUniqueName(item);
    });

    this._listItemSubcription = this._listItems.changes.subscribe((items) => {
      let changeDiff = this._differ.diff(items);
      if (changeDiff) {
        changeDiff.forEachAddedItem((changeRecord: CollectionChangeRecord<BcListItem>) => {
          // added item
          changeRecord.item.listItemUniqueName = this.getListItemUniqueName(changeRecord.item);
        });
        changeDiff.forEachRemovedItem((item: CollectionChangeRecord<BcListItem>) => {
          // removed item
          console.log('Removed BcListItem!!!');
        });
      }
    });
  }

  private getListItemUniqueName(item: BcListItem): string {
    return "bc-list-" + this._listId + '-' + item.listItemId;
  }

  ngOnDestroy(): void {
    this._selectionSubcription.unsubscribe();
    this._listItemSubcription.unsubscribe();
  }
}
