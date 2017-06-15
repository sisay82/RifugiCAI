import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

/**
 * Section of a content, needed as it's used as a selector in the API.
 * @docs-private
 */
@Component({
  selector: 'bc-content > bc-content-section',
  templateUrl: 'contentSection.component.html',
  host: {
    '[class.bc-content-section]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BcContentSection { }