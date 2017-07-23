import {
  Component, trigger, state, style, transition, animate, Input, QueryList,ViewChildren,Injectable, OnDestroy
} from '@angular/core';
import {
  Animations
} from './menu-animations';
import { IMenu } from '../../app/shared/types/interfaces';
import {BcSharedService} from '../../app/shelter/shared.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  animations: [Animations.slideLeftRight]
})
export class BcMenu {
  menuState:string = 'left';
  @Input() menuElements: IMenu;
  toggleMenuSub:Subscription;

  clickItem(link:string){
    /*let outlet=this.shared.currentOutlet
    if(outlet=="revision"){
        this._router.navigate([{outlets:({'revision': [link],'content': null})}],{relativeTo:this._route});
    }else{
        this._router.navigate([{outlets:({'content': [link],'revision': null})}],{relativeTo:this._route});
    }*/
  }

  ngAfterContentInit(){
    if(this.shared!=undefined){
      this.toggleMenuSub=this.shared.toggleMenu$.subscribe(item=>{
        this.toggleMenu();
      });
    }

    this.checkWinPlatform();
  }

  constructor( private shared:BcSharedService){
    this.menuElements={
      elements:[
        {name:"No Menu Provided",icon:"",link:"#"}
      ]
    };
  }
  
  checkWinPlatform(){
    if(navigator.userAgent.indexOf("Win")>-1){
      this.menuState='right';
    }
    return (navigator.userAgent.indexOf("Win")==-1);
  }

  ngOnDestroy(){
    if(this.toggleMenuSub!=undefined){
      this.toggleMenuSub.unsubscribe();
    }
  }

  toggleMenu(){
    this.menuState = this.menuState === 'right' ? 'left' : 'right';
  }
}
