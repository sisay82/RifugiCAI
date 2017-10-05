import {
  Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IUse } from '../../../app/shared/types/interfaces'
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
  selector: 'bc-fruition',
  templateUrl: 'fruition.component.html',
  styleUrls: ['fruition.component.scss'],
  providers:[ShelterService]
})
export class BcFruition {
  data:[IUse]=<any>[];
  activeYear;
  activeTab:IUse;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    this.data=this.data.sort((a,b)=>{return a.year < b.year ? -1 : a.year > b.year ? +1 : 0;})
    shared.activeComponent="use";
    this.shared.onActiveOutletChange("content");
  }

  isActive(year){
    return year==this.activeYear;
  }

  showTab(year){
    if(year!=this.activeYear){
      this.activeYear=year;
      this.activeTab=this.data.find(obj=>obj.year==year);
    }
  }

  getUse(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.use!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"use").subscribe(shelter=>{
                this.detailsService.onChildSave(shelter,"use");
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
      this.detailsService.onChildLoadRequest("use");
    });
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getUse(params["id"])
      .then((shelter)=>{
        this.data = shelter.use.sort((a,b)=>{return a.year < b.year ? -1 : a.year > b.year ? +1 : 0;});
        this.activeTab=shelter.use.find(obj=>obj.year==(new Date().getFullYear()));
        this.activeYear=(new Date()).getFullYear();
        if(!this.activeTab){
          let use:IUse={year:(new Date()).getFullYear()}
          this.data.push(use);
          this.activeTab=use;
        }
        if(routeSub!=undefined){
            routeSub.unsubscribe();
        }
      });
    });
  }

}