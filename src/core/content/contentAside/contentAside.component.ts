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
  selector: 'bc-content > bc-content-aside',
  templateUrl: 'contentAside.component.html',
  host: {
    '[class.bc-content-aside]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BcContentAside { }