import { Directive,ElementRef,OnInit } from '@angular/core';

@Directive({
    selector:'[tooltip]',
    host:{
        '[class.bc-tooltip-disabled]':'_disabled',
        '[class.bc-tooltip-enabled]':'!_disabled',
        '[class.bc-tooltip-enabled-left]':'_state=="left"',
        '[class.bc-tooltip-enabled-right]':'_state=="right"',
        '[class.bc-tooltip-enabled-center]':'_state=="center"',
        '[class.bc-tooltip-enabled-top]':'_state=="top"',
        '(click)':'onClick($event)',
        '(mouseenter)':'onMouseEnter($event)'
    }
})
export class BcTooltip{
    constructor(private ref:ElementRef ){}
    _disabled:boolean=false;
    _state:('left'|'center'|'right'|'top')='center';

    onClick(event:Event){ 
        this._disabled=true;
    }
    onMouseEnter(event:Event){
        this.checkPosition();
        this._disabled=false;
    }

    checkPosition(){
        this._state='center';

        const leftPos = (this.ref.nativeElement.offsetLeft+window.scrollX) > (window.innerWidth-100);
        if(leftPos){
            this._state='left';
        }
        const rightPos = (this.ref.nativeElement.offsetLeft+window.scrollX) < (100);
        if(rightPos){
            this._state='right';
        }

        const topPos = (this.ref.nativeElement.offsetTop+window.scrollY) > (window.innerHeight-50);
        if(topPos){
            this._state='top';
        }

    }

    ngOnInit() {
        this.checkPosition();
    }
}