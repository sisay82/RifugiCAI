import {
  Component,
  ElementRef,
  Renderer2,
  Input,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'bc-divider',
  styleUrls: ['divider.component.scss'],
  template: '',
  host: {
    '[class.bc-divider]': 'true'
  },
  encapsulation: ViewEncapsulation.None
})
export class BcDivider { }