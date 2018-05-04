import { trigger, state, transition, animate, style } from '@angular/animations';

export class Animations {
    public static slideInOut = trigger('slideInOut', [
        state('1', style({ height: '0px', display: "none" })),
        state('0', style({ height: '*' })),
        transition('1 => 0', animate('500ms ease-in')),
        transition('0 => 1', animate('500ms ease-out'))
    ]);
}
