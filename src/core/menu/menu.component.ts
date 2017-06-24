import {
  Component, trigger, state, style, transition, animate, Input, QueryList,ViewChildren,Injectable, Optional
} from '@angular/core';
import {
  Animations
} from './menu-animations';
import { 
  IMenu
} from '../../shared/interfaces';
import {
  BcMenuItem,BcItemService
} from './menu-item.component';
import { BcMenuService } from './menu-toggle.service'

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

  ngAfterContentInit(){
    this._layer_service.select$.subscribe(item=>{
      if(this.current_check!=undefined){
        this.current_check.itemUncheck();
      }
      this.current_check=this._layer_service.current_select;
    });

    this._menu_service.select$.subscribe(item=>{
      this.toggleMenu();
    });
  }

  constructor(private _layer_service:BcItemService,@Optional() private _menu_service:BcMenuService){
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

  toggleMenu(){
    this.menuState = this.menuState === 'right' ? 'left' : 'right';
  }
}
