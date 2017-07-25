import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICatastal,IDrain,IEnergy } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-catastal',
  templateUrl: 'cat.component.html',
  styleUrls: ['cat.component.scss'],
  providers:[ShelterService]
})
export class BcCatastal {
  catastal:ICatastal={};
  drain:IDrain={type:null};
  energy:IEnergy={};
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    shared.activeComponent="catastal";
    shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      let catSub=this.shelterService.getShelterSection(params['id'],"catastal").subscribe(shelter=>{
        this.catastal=shelter.catastal;
        let drainSub=this.shelterService.getShelterSection(params['id'],"drain").subscribe(shelter=>{
          this.drain=shelter.drain;
          let energySub=this.shelterService.getShelterSection(params['id'],"energy").subscribe(shelter=>{
            this.energy=shelter.energy;
              if(drainSub!=undefined){
                drainSub.unsubscribe();
              }
              if(energySub!=undefined){
                energySub.unsubscribe();
              }
              if(catSub!=undefined){
                catSub.unsubscribe();
              }
              if(routeSub!=undefined){
                routeSub.unsubscribe();
              }
          });
        });
      });
    });
  }
}