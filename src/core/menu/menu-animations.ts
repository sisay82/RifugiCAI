import { trigger, state, transition, animate, style } from '@angular/core';

export class Animations {
    public static slideInOut = trigger('slideInOut', [
        state('in', style({ height: '0px'})),
        state('out', style({ height: '*'})),
        transition('in => out', animate('400ms ease-in-out')),
        transition('out => in', animate('400ms ease-in-out'))
    ]);

    public static slideLeftRight = trigger('slideLeftRight',[
        state('left',style({width:'0px',height:'*', '.bc-menu-item-content.display':'none','.bc-menu-layer-content':'none'})),
        state('right',style({width:'*',height:'*', '.bc-menu-item-content.display':'block','.bc-menu-layer-content':'none'})),
        transition('left => right',animate('400ms ease-in-out')),
        transition('right => left',animate('400ms ease-in-out'))
    ]);
}