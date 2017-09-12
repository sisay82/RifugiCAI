import { Component } from '@angular/core';
import {IButton} from '../../shared/types/interfaces';

@Component({ 
  moduleId: module.id,
  selector: 'bc-shelter-map',
  templateUrl: './shelterMap.component.html',
  styleUrls: ['./shelterMap.component.scss']
})
export class BcShelterMap {
    list_view_button:IButton={ref:'list',icon:'th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'map-marker',text:'Mappa',enabled:true,dark_theme:false};
}
