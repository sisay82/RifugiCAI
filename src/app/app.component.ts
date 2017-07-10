import { Component } from '@angular/core';

import {IButton} from './shared/types/interfaces';
import {IMenu}from './shared/types/interfaces';
import { BcSharedService } from './shared/shared.service';

@Component({ 
  moduleId: module.id,
  selector: 'bc-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[BcSharedService]
})

export class AppComponent {
    list_view_button:IButton={ref:'#',icon:'fa fa-th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'fa fa-map-marker',text:'Mappa',enabled:true,dark_theme:false};
}
