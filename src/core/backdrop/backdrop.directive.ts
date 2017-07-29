import {
  Directive
} from '@angular/core';

@Directive({
  selector: 'bc-backdrop',
  host: {
    'role': 'presentation',
    '[class.bc-backdrop]': 'true'
  }
})
export class BcBackdrop {}