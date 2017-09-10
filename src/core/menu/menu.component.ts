import {
  Component, trigger, state, style, transition, animate, Input, QueryList,ViewChildren,Injectable, OnDestroy,ViewEncapsulation,Directive
} from '@angular/core';
import {
  Animations
} from './menu-animations';
import { IMenu } from '../../app/shared/types/interfaces';
import {BcSharedService} from '../../app/shared/shared.service'
import { Subscription } from 'rxjs/Subscription';
import { Router,ActivatedRoute } from '@angular/router';
import { BcAuthService } from '../../app/shared/auth.service';
import {Enums} from '../../app/shared/types/enums';

@Directive({
    selector: 'a[bc-menu-element]',
    host: {
        '[class.active]': 'active'
    }
})
export class BcMenuElementStyler {
   @Input('bc-menu-element') active: boolean;
}

@Directive({
  selector: 'a[disabled-element]',
  host: {
      '[class.disabled]': 'disabled'
  }
})
export class BcDisabledMenuElementStyler {
 @Input('disabled-element') disabled: boolean;
}

@Component({
  moduleId: module.id,
  selector: 'bc-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  animations: [Animations.slideLeftRight],
  encapsulation:ViewEncapsulation.None
})
export class BcMenu {
  menuState:string = 'left';
  @Input() menuElements: IMenu;
  toggleMenuSub:Subscription;
  menuPermissionSub:Subscription;
  detailPermission:boolean=false;
  documentPermission:boolean=false;
  economyPermission:boolean=false;
  getLink(link:String):any{
    let outlet=this.shared.activeOutlet;
    let routerLink;
    if(outlet=="revision"){
      routerLink = [{outlets:({'revision': [link],'content': null})}];
    }else{
      routerLink = [{outlets:({'content': [link],'revision': null})}];
    }
    return routerLink;
  }

  isActiveLink(link:string){
    let component=this.shared.activeComponent;
    return (component==link)
  }

  ngAfterContentInit(){
    if(this.shared!=undefined){
      this.toggleMenuSub=this.shared.toggleMenu$.subscribe(item=>{
        this.toggleMenu();
      });
    }

    this.checkWinPlatform();
  }

  constructor(private route:ActivatedRoute,private router:Router,private shared:BcSharedService,private authService:BcAuthService){
    if(this.menuElements==undefined){
      this.menuElements={
        layers:[
          {elements:[{name:"No Menu Provided",icon:"",link:"#"}]}
        ]
      };
    }

    this.menuPermissionSub = authService.getPermissions().subscribe(permissions=>{
      this.detailPermission = permissions.find(obj=>obj==Enums.MenuSection.detail)>-1;
      this.documentPermission = permissions.find(obj=>obj==Enums.MenuSection.document)>-1;
      this.economyPermission = permissions.find(obj=>obj==Enums.MenuSection.economy)>-1;
    });
  }

  isActiveLayer(layer){
    if(this.shared.activeOutlet=="content"){
      return true;
    }else{
      if(layer=="detail"){
        return this.detailPermission;
      }else if(layer=="document"){
        return this.documentPermission;
      }else if(layer=="economy"){
        return this.economyPermission
      }else{
        return false;
      }
    }
  }
  
  checkWinPlatform(){
    if(navigator.userAgent.indexOf("Win")>-1){
      this.menuState='right';
    }
    return (navigator.userAgent.indexOf("Win")==-1);
  }

  ngOnDestroy(){
    if(this.menuPermissionSub!=undefined){
      this.menuPermissionSub.unsubscribe();
    }
    if(this.toggleMenuSub!=undefined){
      this.toggleMenuSub.unsubscribe();
    }
  }

  toggleMenu(){
    this.menuState = this.menuState === 'right' ? 'left' : 'right';
  }
}
