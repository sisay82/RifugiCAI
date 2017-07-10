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
  categories:{name:String,services:IService[]}[]=[];
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    shared.activeComponent="services";
    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }


  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      let shelSub=this.shelterService.getShelterSection(params['id'],"services").subscribe(shelter=>{
        for(let service of shelter.services){
          let category=this.categories.find(cat=>cat.name==service.category);
          if(category!=undefined){
            category.services.push(service);
          }else{
            category={
              name:service.category,
              services:[service]
            }
            this.categories.push(category);
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