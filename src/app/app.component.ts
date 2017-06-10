import { Component } from '@angular/core';

import {IButton} from '../shared/interfaces';
import {IMenu}from '../shared/interfaces';
@Component({ 
  moduleId: module.id,
  selector: 'bc-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
    list_view_button:IButton={ref:'#',icon:'fa fa-th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'fa fa-map-marker',text:'Mappa',enabled:true,dark_theme:false};
}
