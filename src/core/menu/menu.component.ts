import {
  Component, trigger, state, style, transition, animate, Input, QueryList,ViewChildren,Injectable, OnDestroy,ViewEncapsulation,Directive
} from '@angular/core';
import {
  Animations
} from './menu-animations';
import { IMenu } from '../../app/shared/types/interfaces';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { Router,ActivatedRoute } from '@angular/router';

@Directive({
    selector: 'a[bc-menu-element]',
    host: {
        '[class.active]': 'active'
    }
})
export class BcMenuElementStyler {
   @Input('bc-menu-element') active: boolean;
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

  constructor(private route:ActivatedRoute,private router:Router,private shared:BcSharedService){
    if(this.menuElements==undefined){
      this.menuElements={
        elements:[
          {name:"No Menu Provided",icon:"",link:"#"}
        ]
      };
    }
    
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