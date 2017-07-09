import {
  Component, trigger, state, style, transition, animate, Input, QueryList,ViewChildren,Injectable, Optional, OnDestroy
} from '@angular/core';
import {
  Animations
} from './menu-animations';
import { IMenu } from '../../app/shared/types/interfaces';
import {
  BcMenuItem,BcItemService
} from './menu-item.component';
import {BcSharedService} from '../../app/shelter/shared.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  animations: [Animations.slideLeftRight],
  providers:[BcItemService]
})
export class BcMenu {
  current_check:BcMenuItem;
  @ViewChildren(BcMenuItem) _list_layers: QueryList<BcMenuItem>;
  menuState:string = 'left';
  @Input() menuElements: IMenu;
  toggleMenuSub:Subscription;
  itemClickSub:Subscription;

  ngAfterContentInit(){
    this.itemClickSub=this._layer_service.select$.subscribe(item=>{
      if(this.current_check!=undefined){
        this.current_check.itemUncheck();
      }
      this.current_check=this._layer_service.current_select;
    });
    this.checkWinPlatform();

    if(this.shared!=undefined){
      this.toggleMenuSub=this.shared.toggleMenu$.subscribe(item=>{
        this.toggleMenu();
      });
    }

    this.checkWinPlatform();
  }

  constructor(private _layer_service:BcItemService,@Optional() private shared:BcSharedService){
    this.menuElements={
      layers:[{
        layerName:"Default",
        elements:[
          {name:"No Menu Provided",icon:"",link:"#"}
        ]}
      ]
    };
  }
  
  checkWinPlatform(){
    if(navigator.userAgent.indexOf("Win")>-1){
      this.menuState='right';
    }
    return (navigator.userAgent.indexOf("Win")==-1);
  }

  getClass(){
    if(navigator.userAgent.indexOf("Win")>-1){
      return "";
    }else{
      return "bc-list-overlap";
    }
  }

  ngOnDestroy(){
    if(this.toggleMenuSub!=undefined){
      this.toggleMenuSub.unsubscribe();
    }
    if(this.itemClickSub!=undefined){
      this.itemClickSub.unsubscribe();
    }
  }

  toggleMenu(){
    this.menuState = this.menuState === 'right' ? 'left' : 'right';
  }
}
