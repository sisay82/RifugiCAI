import { Component, Input } from '@angular/core';
import {IButton} from '../../shared/interfaces';
import { Router } from '@angular/router';
@Component({
    moduleId:module.id,
    selector:'bc-button',
    templateUrl: 'button.component.html',
    styleUrls: ['button.component.scss']
})
export class BcButton{
    @Input() button:IButton;

     constructor(private router:Router){}

    btnClick(){
        if(this.button.action==undefined){
            this.router.navigateByUrl(this.button.ref);
        }else{
            this.button.action();
        }
    }

    checkPlatform(){
        if(navigator.userAgent.indexOf("Win")>-1){
            return true;
        }else{
            return false;
        }
    }

    getClass(){
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