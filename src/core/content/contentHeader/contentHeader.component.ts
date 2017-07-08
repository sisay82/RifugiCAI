import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

/**
 * Header of a content, needed as it's used as a selector in the API.
 * @docs-private
 */
@Component({
  selector: 'bc-content > bc-content-header',
  templateUrl: 'contentHeader.component.html',
  host: {
    '[class.bc-content-header]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BcContentHeader { }