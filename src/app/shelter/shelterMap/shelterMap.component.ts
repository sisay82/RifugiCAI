import { Component } from '@angular/core';
import {IButton} from '../../shared/types/interfaces';
import {BcAuthService} from '../../shared/auth.service';
import { Enums } from '../../shared/types/enums';

@Component({ 
  moduleId: module.id,
  selector: 'bc-shelter-map',
  templateUrl: './shelterMap.component.html',
  styleUrls: ['./shelterMap.component.scss']
})
export class BcShelterMap {
    list_view_button:IButton={ref:'list',icon:'th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'map-marker',text:'Mappa',enabled:true,dark_theme:false};
    private profile:{code:String,role:Enums.User_Type};
    
    constructor(private authService:BcAuthService){

    }

    private checkUser(code:String):any{
      return code.substr(0,2)
    }

    private getRegion(code:String){
      return code.substr(2,2);
    }

    private getSection(code:String){
      return code.substr(4,3);
    }

    private isCentralUser(){
      return (this.profile&&this.profile.role==Enums.User_Type.central);
    }

    ngOnInit(){
      let permissionSub = this.authService.getUserProfile().subscribe(profile=>{
        this.profile=profile;
        
        let section;
        let region;
        if(profile.role==Enums.User_Type.regional){
            region=this.getRegion(profile.code);
        }else if(profile.role==Enums.User_Type.sectional){
            section=this.getSection(profile.code);
        }else if(profile.role!=Enums.User_Type.central){
            console.log("Invalid User");
            return;
        }
      });
    }
}
