import { Component, Input, Injectable, OnInit,Optional, Directive,ViewEncapsulation } from '@angular/core';
import {IButton} from '../../app/shared/types/interfaces';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BcButtonService{
    private selectSource = new Subject<string>();
    select$ = this.selectSource.asObservable();
    onChildSelect(){
        this.selectSource.next();
    }
}

@Directive({
  selector: 'button[selected]',
  host: {
    '[class.bc-button-select]': 'selected'
  }
})
export class BcSelectButtonStyler{
    @Input("selected") selected:boolean=false;
}

@Component({
    moduleId:module.id,
    selector:'bc-button',
    templateUrl: 'button.component.html',
    styleUrls: ['button.component.scss'],
    host:{
        'class':'bc-button'
    },
    encapsulation:ViewEncapsulation.None
})
export class BcButton{
    @Input() button:IButton;
    @Input() disabled:boolean=false;
    @Input() pre_selected:boolean=false;
    private selected:Boolean=false;

    constructor(private router:Router,@Optional() private _button_service: BcButtonService){}

    btnClick(){
        if(this._button_service!=undefined){
            this.selected=true
            this._button_service.onChildSelect();
        }
        if(this.button.action==undefined){
            this.router.navigateByUrl(this.button.ref);
        }else{
            this.button.action.call(this.button.ref);
        }
    }

    btnUncheck(){
        this.selected=false;
    }

    checkPlatform(){
        if(navigator.userAgent.indexOf("Win")>-1){
            return true;
        }else{
            return false;
        }
    }

    ngOnInit() {
        if(this.pre_selected){
            this.selected=true;
        }
    }
}