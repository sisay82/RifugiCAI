import {
  Component,Injectable
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BcMenuService } from './menu-toggle.service'

@Component({
  moduleId: module.id,
  selector: 'bc-menu-toggle',
  templateUrl:'menu-toggle.component.html',
  styleUrls:['menu-toggle.component.scss']
})
export class BcMenuToggle {
    constructor(private _menu_service:BcMenuService){}

    toggleMenu(){
        this._menu_service.onSelect();
    }

    checkWinPlatform(){
      return (navigator.userAgent.indexOf("Win")==-1);
    }

}