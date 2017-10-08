import {
  Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter,IEconomy, IContribution } from '../../../app/shared/types/interfaces'
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {BcSharedService} from '../../../app/shared/shared.service'
import {BcDetailsService} from '../details.service';

@Directive({
  selector:"div[active]",
  host:{
    "[class.bc-tab-active]":"active"
  }
})
export class BcActiveTabStyler{
  @Input("active") active:boolean=false;
}


@Component({
  moduleId: module.id,
  selector: 'bc-economy',
  templateUrl: 'economy.component.html',
  styleUrls: ['economy.component.scss'],
  providers:[ShelterService]
})
export class BcEconomy {
  economy:[IEconomy]=<any>[];
  contributions:[IContribution]=<any>[];
  activeYear;
  activeTab:IEconomy;
  balanceSheet:number=0;
  revenues:number=0;
  outgos:number=0;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="economy";
    this.shared.onActiveOutletChange("content");
  }

  isActive(year){
    return year==this.activeYear;
  }

  showTab(year){
    if(year!=this.activeYear){
      this.changeActiveTab(year,this.economy.find(obj=>obj.year==year));
    }
  }

  changeActiveTab(year,newTab:IEconomy){
    this.activeYear=year;
    if(newTab){
      this.activeTab=newTab;
    }else{
      this.activeTab={year:year};
    }
    this.setBalanceSheet();
  }

  getTotal(value,tax){
    if(tax>1){
      return (value*(tax/100))+value;
    }else{
      return (value*tax)+value;
    }
  }

  setBalanceSheet(){
    let total:number=0;
    let totRevenues:number=0;
    let totOutgos:number=0;
    if(this.activeTab&&this.activeTab.files){
      this.activeTab.files.forEach(file=>{
        file.outgos.forEach(entry=>{
          totOutgos+=<number>entry.value;
        });
        file.revenues.forEach(entry=>{
          totRevenues+=<number>entry.value;
        });
      });
    }
    this.outgos=totOutgos;
    this.revenues=totRevenues;
    total=totRevenues-totOutgos;
    if(this.contributions){
      this.contributions.forEach(contr=>{
        total+=<number>contr.value;
      });
    }
    this.balanceSheet=total;
    return total;
  }

  getEconomy(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.use!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"economy").subscribe(shelter=>{
                this.detailsService.onChildSave(shelter,"economy");
                if(shelSub!=undefined){
                    shelSub.unsubscribe();
                }
                if(revSub!=undefined){
                    revSub.unsubscribe();
                }
                resolve(shelter);
              });
          }
      });
      this.detailsService.onChildLoadRequest("economy");
    });
  }

  getContributions(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.use!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"contributions").subscribe(shelter=>{
                this.detailsService.onChildSave(shelter,"contributions");
                if(shelSub!=undefined){
                    shelSub.unsubscribe();
                }
                if(revSub!=undefined){
                    revSub.unsubscribe();
                }
                resolve(shelter);
              });
          }
      });
      this.detailsService.onChildLoadRequest("contributions");
    });
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getEconomy(params["id"])
      .then((shelter)=>{
        this.getContributions(params["id"])
        .then(shel=>{
          this.contributions=shel.contributions.filter(obj=>obj.accepted) as [IContribution];
          if(routeSub!=undefined){
            routeSub.unsubscribe();
          }
        });
        let tab;
        let year;
        year=(new Date()).getFullYear();        
        if(shelter.economy&&shelter.economy.length>0){
          this.economy = shelter.economy.sort((a,b)=>{return a.year < b.year ? -1 : a.year > b.year ? +1 : 0;});       
          tab=shelter.economy.find(obj=>obj.year==(new Date().getFullYear()));     
        }else{
          let economy:IEconomy={year:(new Date()).getFullYear()}
          this.economy=[economy];
        }
        this.changeActiveTab(year,tab);
      });
    });
  }
}