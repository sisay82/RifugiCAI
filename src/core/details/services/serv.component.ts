import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { IService } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { ActivatedRoute } from '@angular/router';
import {BcSharedService} from '../../../app/shelter/shelterPage/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-serv',
  templateUrl: 'serv.component.html',
  styleUrls: ['serv.component.scss'],
  providers:[ShelterService]

})
export class BcServ {
  services:IService[];
  activeComponentSub:Subscription;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    this.activeComponentSub=this.shared.activeComponentRequest$.subscribe(()=>{
      this.shared.onActiveComponentAnswer("services");
    })

    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){
    this.activeComponentSub.unsubscribe();
  }


  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      let shelSub=this.shelterService.getShelterSection(params['id'],"services").subscribe(shelter=>{
        this.services=shelter.services;
        shelSub.unsubscribe();
        routeSub.unsubscribe();
      });
    });
  }


}