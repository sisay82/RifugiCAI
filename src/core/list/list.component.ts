// // /** Coerces a data-bound value (typically a string) to a number. */
// // export function coerceNumberProperty(value: any, fallbackValue = 0) {
// //   // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
// //   // and other non-number values as NaN, where Number just uses 0) but it considers the string
// //   // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
// //   return isNaN(parseFloat(value as any)) || isNaN(Number(value)) ? fallbackValue : Number(value);
// // }
// // //value != null && `${value}` !== 'false';


// import {
//   Component,
//   ViewEncapsulation,
// } from '@angular/core';

// @Component({
//   moduleId: module.id,
//   selector: 'bc-list',
//   host: { 'role': 'list'},
//   templateUrl: 'list.component.html',
//   styleUrls: ['list.css'],
//   encapsulation: ViewEncapsulation.None
// })
// export class BcList {}











// // //import {MdLine, MdLineSetter, coerceBooleanProperty} from '../core';

// // @Directive({
// //   selector: 'bc-divider'
// // })
// // export class BcListDivider {}

// // @Component({
// //   moduleId: module.id,
// //   selector: 'bc-list',
// //   host: { 'role': 'list'},
// //   templateUrl: 'list.component.html',
// //   styleUrls: ['list.css'],
// //   encapsulation: ViewEncapsulation.None
// // })
// // export class BcList {
// //   private _disableRipple: boolean = false;

// //   /**
// //    * Whether the ripple effect should be disabled on the list-items or not.
// //    * This flag only has an effect for `md-nav-list` components.
// //    */
// //   @Input()
// //   get disableRipple() { return this._disableRipple; }
// //   set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
// // }

// // /**
// //  * Directive whose purpose is to add the bc- CSS styling to this selector.
// //  * @docs-private
// //  */
// // @Directive({
// //   selector: 'bc-list',
// //   host: {
// //     '[class.bc-list]': 'true'
// //   }
// // })
// // export class MdListCssMatStyler {}

// // /**
// //  * Directive whose purpose is to add the bc- CSS styling to this selector.
// //  */
// // @Directive({
// //   selector: 'bc-alternate',
// //   host: {
// //     '[class.bc-alternate]': 'true'
// //   }
// // })
// // export class bcAlternateCss {}

// // /**
// //  * Directive whose purpose is to add the bc- CSS styling to this selector.
// //  * @docs-private
// //  */
// // @Directive({
// //   selector: 'bc-divider',
// //   host: {
// //     '[class.bc-divider]': 'true'
// //   }
// // })
// // export class MdDividerCssMatStyler {}

// // /**
// //  * Directive whose purpose is to add the bc- CSS styling to this selector.
// //  * @docs-private
// //  */
// // @Directive({
// //   selector: '[bc-list-avatar]',
// //   host: {
// //     '[class.bc-list-avatar]': 'true'
// //   }
// // })
// // export class MdListAvatarCssMatStyler {}

// // /**
// //  * Directive whose purpose is to add the bc- CSS styling to this selector.
// //  * @docs-private
// //  */
// // @Directive({
// //   selector: '[bc-list-icon]',
// //   host: {
// //     '[class.bc-list-icon]': 'true'
// //   }
// // })
// // export class MdListIconCssMatStyler {}

// // /**
// //  * Directive whose purpose is to add the bc- CSS styling to this selector.
// //  * @docs-private
// //  */
// // @Directive({
// //   selector: '[bc-subheader]',
// //   host: {
// //     '[class.bc-subheader]': 'true'
// //   }
// // })
// // export class MdListSubheaderCssMatStyler {}

// // @Component({
// //   moduleId: module.id,
// //   selector: 'bc-list-item, a[bc-list-item]',
// //   host: {
// //     'role': 'listitem',
// //     '(focus)': '_handleFocus()',
// //     '(blur)': '_handleBlur()',
// //     '[class.bc-list-item]': 'true',
// //   },
// //   templateUrl: 'list-item.html',
// //   encapsulation: ViewEncapsulation.None
// // })
// // export class MdListItem implements AfterContentInit {
// //   private _lineSetter: MdLineSetter;
// //   private _disableRipple: boolean = false;
// //   private _isNavList: boolean = false;

// //   _hasFocus: boolean = false;

// //   /**
// //    * Whether the ripple effect on click should be disabled. This applies only to list items that are
// //    * part of a nav list. The value of `disableRipple` on the `md-nav-list` overrides this flag.
// //    */
// //   @Input()
// //   get disableRipple() { return this._disableRipple; }
// //   set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }

// //   @ContentChildren(MdLine) _lines: QueryList<MdLine>;

// //   @ContentChild(MdListAvatarCssMatStyler)
// //   set _hasAvatar(avatar: MdListAvatarCssMatStyler) {
// //     if (avatar != null) {
// //       this._renderer.addClass(this._element.nativeElement, 'bc-list-item-avatar');
// //     } else {
// //       this._renderer.removeClass(this._element.nativeElement, 'bc-list-item-avatar');
// //     }
// //   }

// //   constructor(private _renderer: Renderer2,
// //               private _element: ElementRef,
// //               @Optional() private _list: BcList,
// //               @Optional() navList: MdNavListCssMatStyler) {
// //     this._isNavList = !!navList;
// //   }

// //   ngAfterContentInit() {
// //     this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
// //   }

// //   /** Whether this list item should show a ripple effect when clicked.  */
// //   isRippleEnabled() {
// //     return !this.disableRipple && this._isNavList && !this._list.disableRipple;
// //   }

// //   _handleFocus() {
// //     this._hasFocus = true;
// //   }

// //   _handleBlur() {
// //     this._hasFocus = false;
// //   }
// // }
