import { Directive,ElementRef } from '@angular/core';

@Directive({
    selector:'[tooltip]',
    host:{
        '[class.disabled-tooltip]':'_disabled',
        '[class.bc-tooltip]':'true',
        '(click)':'onClick($event)',
        '(mouseenter)':'onMouseEnter($event)'
    }
})
export class BcTooltip{
    constructor(private ref:ElementRef){}
    _disabled:boolean=false;
    onClick(event:Event){ 
        console.log(this.ref.nativeElement)
        this._disabled=true;
    }
    onMouseEnter(event:Event){
        this._disabled=false;
    }
}