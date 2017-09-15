import { Component,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import {IButton} from '../../shared/types/interfaces';
import {BcAuthService} from '../../shared/auth.service';
import { Subscription } from 'rxjs/Subscription';
@Component({ 
  moduleId: module.id,
  selector: 'bc-shelter-map',
  templateUrl: './shelterMap.component.html',
  styleUrls: ['./shelterMap.component.scss']
})
export class BcShelterMap {
    list_view_button:IButton={ref:'list',icon:'th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'map-marker',text:'Mappa',enabled:true,dark_theme:false};
    authorization:boolean;
    
    constructor(private authService:BcAuthService,private cd:ChangeDetectorRef){
      
    }

    getAuth(){
      return this.authorization;
    }

    ngAfterViewInit() {
      let permSub = this.authService.getUserProfile().subscribe(profile=>{
          if(profile){
              this.authorization=true;
          }
          if(permSub){
              permSub.unsubscribe();
          }
          this.cd.detectChanges();
      });
    }   
}
