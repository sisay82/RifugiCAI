import { trigger, state, transition, animate, style } from '@angular/animations';

export class Animations {
    public static slideInOut = trigger('slideInOut', [
        state('in', style({ height: '0px' })),
        state('out', style({ height: '*' })),
        transition('in => out', animate('400ms linear')),
        transition('out => in', animate('400ms linear'))
    ]);

    public static slideLeftRight = trigger('slideLeftRight', [
        state('left', style({ width: '0px', height: '*', display: "none" })),
        state('right', style({ width: '*', height: '*', display: "block" })),
        transition('left => right', animate('400ms linear')),
        transition('right => left', animate('400ms linear'))
    ]);
}
