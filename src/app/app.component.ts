import { Component } from '@angular/core';
import { BcSharedService } from './shared/shared.service';

@Component({ 
  moduleId: module.id,
  selector: 'bc-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[BcSharedService]

})
export class AppComponent { 

}
