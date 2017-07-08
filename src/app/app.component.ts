import { Component } from '@angular/core';
import { BcMenuService } from '../core/menu/menu-toggle.service'

@Component({ 
  moduleId: module.id,
  selector: 'bc-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[BcMenuService]
})
export class AppComponent { 

}
