import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICatastal,IDrain,IEnergy } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {BcDetailsService} from '../details.service';
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
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="catastal";
    shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }

  getDrain(id):Promise<void>{
    return new Promise<void>((resolve,reject)=>{
      let revDrainSub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.drain!=undefined){
              this.drain=shelter.drain;
              if(revDrainSub!=undefined){
                  revDrainSub.unsubscribe();
              }
              resolve();
          }else{
              let catSub=this.shelterService.getShelterSection(id,"drain").subscribe(shel=>{
                  if(shel.drain==undefined) shel.drain={};
                  this.drain=shel.drain;
                  this.detailsService.onChildSave(shel,"drain");
                  if(catSub!=undefined){
                      catSub.unsubscribe();
                  }
                  if(revDrainSub!=undefined){
                      revDrainSub.unsubscribe();
                  }
                  resolve();
              });
          }
      });
      this.detailsService.onChildLoadRequest("drain");
    });
}

getEnergy(id):Promise<void>{
  return new Promise<void>((resolve,reject)=>{
      let revEnergySub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.energy!=undefined){
              this.energy=shelter.energy;
              if(revEnergySub!=undefined){
                  revEnergySub.unsubscribe();
              }
              resolve();
          }else{
              let catSub=this.shelterService.getShelterSection(id,"energy").subscribe(shel=>{
                  if(shel.energy==undefined) shel.energy={};
                  this.energy=shel.energy;
                  this.detailsService.onChildSave(shel,"energy");
                  if(catSub!=undefined){
                      catSub.unsubscribe();
                  }
                  if(revEnergySub!=undefined){
                      revEnergySub.unsubscribe();
                  }
                  resolve();
              });
          }
      });
      this.detailsService.onChildLoadRequest("energy");
    });
}

getCatastal(id):Promise<void>{
  return new Promise<void>((resolve,reject)=>{
      let revCatSub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.catastal!=undefined){
              this.catastal=shelter.catastal;
              if(revCatSub!=undefined){
                  revCatSub.unsubscribe();
              }
              resolve();
          }else{
              let catSub=this.shelterService.getShelterSection(id,"catastal").subscribe(shel=>{
                  if(shel.catastal==undefined) shel.catastal={};
                  this.catastal=shel.catastal;
                  this.detailsService.onChildSave(shel,"catastal");
                  if(catSub!=undefined){
                      catSub.unsubscribe();
                  }
                  if(revCatSub!=undefined){
                      revCatSub.unsubscribe();
                  }
                  resolve();
              });
          }
      });
      this.detailsService.onChildLoadRequest("catastal");
    });
  }

  ngOnInit(){

    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getCatastal(params["id"])
      .then(()=>{
          this.getEnergy(params["id"])
          .then(()=>{
              this.getDrain(params["id"])
              .then(()=>{
                  if(routeSub!=undefined)
                      routeSub.unsubscribe();
              });
          });
      });
    });
  }

}