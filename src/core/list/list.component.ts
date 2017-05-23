
import {
  Component,
  ViewEncapsulation,
  Directive
} from '@angular/core';

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
    'role': 'list'
  },
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BcList {
}
