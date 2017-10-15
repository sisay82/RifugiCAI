import { Component,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import {BcAuthService} from '../../shared/auth.service';
import { Subscription } from 'rxjs/Subscription';
@Component({ 
  moduleId: module.id,
  selector: 'bc-shelter-map',
  templateUrl: './shelterMap.component.html',
  styleUrls: ['./shelterMap.component.scss']
})
export class BcShelterMap {
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
