import { Directive,ElementRef,OnInit } from '@angular/core';

@Directive({
    selector:'[tooltip]',
    host:{
        '[class.disabled-tooltip]':'_disabled',
        '[class.bc-tooltip-enabled]':'true',
        '[class.bc-tooltip-left]':'_left',
        '(click)':'onClick($event)',
        '(mouseenter)':'onMouseEnter($event)'
    }
})
export class BcTooltip{
    constructor(private ref:ElementRef ){}
    _disabled:boolean=false;
    _left:boolean=false;
    onClick(event:Event){ 
        this._disabled=true;
    }
    onMouseEnter(event:Event){
        this._disabled=false;
    }

    ngOnInit() {
        let leftPos = (this.ref.nativeElement.getBoundingClientRect().left+window.scrollX) > (window.screen.width/2);
        this._left=leftPos;
        console.log(leftPos)
    }
}