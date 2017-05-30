
import {
  Component, trigger, state, style, transition, animate, Input
} from '@angular/core';
import {
  Animations
} from './menu-animations';
import { 
  IMenuElement
} from '../../shared/interfaces';

@Component({
  moduleId: module.id,
  selector: 'bc-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  animations: [Animations.slideLeftRight]
})
export class BcMenu {
  menuState:string = 'left';
  @Input() menuElements: IMenuElement;

  constructor(){//DEFAULT
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

  clickEvent(obj:any){
      console.log(obj.link);
  }

  toggleMenu(){
    this.menuState = this.menuState === 'right' ? 'left' : 'right';
  }
}
