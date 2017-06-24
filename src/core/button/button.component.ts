import { Component, Input, Injectable, OnInit,Optional } from '@angular/core';
import {IButton} from '../../shared/interfaces';
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

@Component({
    moduleId:module.id,
    selector:'bc-button',
    templateUrl: 'button.component.html',
    styleUrls: ['button.component.scss']    
})
export class BcButton{
    @Input() button:IButton;
    local_style:string;
    private _selected:Boolean;

    constructor(private router:Router,@Optional() private _button_service: BcButtonService){
        this.local_style=this.getClass();
    }

    btnClick(){
        if(this._button_service!=undefined){
            this._selected=true;
            this._button_service.onChildSelect();
            let style=this.getClass();
            this.local_style=style.concat(" bc-selected-button-light");
        }
        if(this.button.action==undefined){
            this.router.navigateByUrl(this.button.ref);
        }else{
            this.button.action();
        }
    }

    btnUncheck(){
        if(!this._selected)
            this.local_style=this.getClass();
        else this._selected=false;
    }

    checkPlatform(){
        if(navigator.userAgent.indexOf("Win")>-1){
            return true;
        }else{
            return false;
        }
    }

    ngOnInit(){
        this.local_style=this.getClass();
    }

    getClass(){
        if(this.button!=undefined){
            let ret_class="btn btn-default bc-button";
            if(this.button.enabled===undefined){
                this.button.enabled=true;
            }
            if(this.button.dark_theme===undefined){
                this.button.dark_theme=false;
            }

            if(this.button.dark_theme){
                ret_class=ret_class.concat(" dark-theme-button");
            }else{
                ret_class=ret_class.concat(" light-theme-button");
            }

            return ret_class;
        }
    }
}