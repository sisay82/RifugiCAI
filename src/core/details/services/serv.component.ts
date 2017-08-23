import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { IService } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { ActivatedRoute } from '@angular/router';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-serv',
  templateUrl: 'serv.component.html',
  styleUrls: ['serv.component.scss'],
  providers:[ShelterService]

})
export class BcServ {
  services:IService[]=[];
  activeComponentSub:Subscription;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    shared.activeComponent="services";
    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }


  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      let shelSub=this.shelterService.getShelterSection(params['id'],"services").subscribe(shelter=>{
        if(shelter.services!=undefined){
          for(let service of shelter.services){
            if(service.category!=undefined){
              let s = this.services.find(ser=>ser.category.toLowerCase().indexOf(service.category.toLowerCase())>-1);
              if(s==undefined){
                this.services.push(service);
              }else{
                for(let tag of service.tags){
                  let t = s.tags.find(cTag=>cTag.key.toLowerCase().indexOf(tag.key.toLowerCase())>-1);
                  if(t==undefined){
                    s.tags.push(tag);
                  }
                }
              }
            }
          }
        }
        if(shelSub!=undefined){
          shelSub.unsubscribe();
        }
        if(routeSub!=undefined){
          routeSub.unsubscribe();
        }
      });
    });
  }


}