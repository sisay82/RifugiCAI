import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

/**
 * Footer of a content, needed as it's used as a selector in the API.
 * @docs-private
 */
@Component({
  selector: 'bc-content > bc-content-footer',
  templateUrl: 'contentFooter.component.html',
  host: {
    '[class.bc-content-footer]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BcContentFooter { }