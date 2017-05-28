
import {
  Component, trigger, state, style, transition, animate
} from '@angular/core';
import {
  Animations
} from './menu-animations'


@Component({
  moduleId: module.id,
  selector: 'bc-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  animations: [Animations.slideLeftRight]
})
export class BcMenu {
  menuState:string = 'left';
  layer:any[]=[
    {lay:[
      {name:"Dati geografici",icon:"fa-map-signs",link:"geographics"},
      {name:"Servizi",icon:"fa-home",link:"#"},
      {name:"Contatti e apertura",icon:"fa-phone",link:"#"},
      {name:"Proprietá e gestione",icon:"fa-user",link:"#"},
      {name:"Dati catastali",icon:"fa-book",link:"#"}
      ]},
    {lay:[
      {name:"Documenti",icon:"fa-file-pdf-o",link:"#"},
      {name:"Immagini",icon:"fa-picture-o",link:"#"}
      ]},
    {lay:[
      {name:"Economia",icon:"fa-certificate",link:"#"},
      {name:"Richiesta contributi",icon:"fa-eur",link:"#"},
      {name:"Fruizione",icon:"fa-bar-chart",link:"#"}
    ]}
  ];

  checkWinPlatform(){
    if(navigator.userAgent.indexOf("Win")>-1){
      this.menuState='right';
    }
    return (navigator.userAgent.indexOf("Win")==-1);
  }

  clickEvent(obj:any){
      console.log(obj.link);
  }

  toggleMenu(){
    this.menuState = this.menuState === 'right' ? 'left' : 'right';
  }
}
