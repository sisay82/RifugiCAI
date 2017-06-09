import { Component } from '@angular/core';
import {IButton} from '../shared/interfaces';
import {IMenuElement}from '../shared/interfaces';
@Component({ 
  moduleId: module.id,
  selector: 'bc-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    list_view_button:IButton={ref:'#',icon:'fa fa-th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'fa fa-map-marker',text:'Mappa',enabled:true,dark_theme:false};

  appMenuElements:IMenuElement={
    layers:[{
      layerName:"Publics",
      elements:[
        {name:"Dati geografici",icon:"fa-map-signs",link:"geographics"},
        {name:"Servizi",icon:"fa-home",link:"#"},
        {name:"Contatti e apertura",icon:"fa-phone",link:"#"},
        {name:"Proprietá e gestione",icon:"fa-user",link:"#"},
        {name:"Dati catastali",icon:"fa-book",link:"#"}
        ]},{
      layerName:"Documents",
      elements:[
        {name:"Documenti",icon:"fa-file-pdf-o",link:"#"},
        {name:"Immagini",icon:"fa-picture-o",link:"#"}
        ]},{
      layerName:"Economy",
      elements:[
        {name:"Economia",icon:"fa-certificate",link:"#"},
        {name:"Richiesta contributi",icon:"fa-eur",link:"#"},
        {name:"Fruizione",icon:"fa-bar-chart",link:"#"}
      ]}
    ]
  };
}
