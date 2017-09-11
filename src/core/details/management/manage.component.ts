import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagement,ISubject,IShelter } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { BcDetailsService } from '../details.service';

@Component({
  moduleId: module.id,
  selector: 'bc-manage',
  templateUrl: 'manage.component.html',
  styleUrls: ['manage.component.scss'],
  providers:[ShelterService]
})
export class BcManage {
  data:IManagement={subject:[{name:null}]};
  owner:ISubject;
  managers:ISubject[]=[];
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="management";
    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }

  initManagement(management:IManagement){
    this.data=management;
    if(this.data!=undefined&&this.data.subject!=undefined){
      this.data.subject.forEach(subject=>{
        if(subject.type!=undefined&&subject.type.toLowerCase().indexOf("proprietario")>-1){
          this.owner=subject;
        }else{
          this.managers.push(subject);
        }
      })
    }

  }

  getManagement(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let detSub=this.detailsService.load$.subscribe(shelter=>{
            if(shelter!=null&&shelter.management!=undefined){
                if(detSub!=undefined){
                  detSub.unsubscribe();
                }
                resolve(shelter);
            }else{
                let managSub=this.shelterService.getShelterSection(id,"management").subscribe(shelter=>{
                    if(shelter.management==undefined) shelter.management={subject:[] as [ISubject]};
                    this.detailsService.onChildSave(shelter,"management");
                    if(managSub!=undefined){
                        managSub.unsubscribe();
                    }
                    if(detSub!=undefined){
                      detSub.unsubscribe();
                    }
                    resolve(shelter);
                });
            }
        });
        this.detailsService.onChildLoadRequest("management");
    });
}

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getManagement(params["id"])
      .then(shelter=>{
          this.initManagement(shelter.management);
          if(routeSub!=undefined){
              routeSub.unsubscribe();
          }
      });
    });
  }

  getDifferenceDates(date1:Date,date2:Date){
    let d1=new Date(date1);
    let d2=new Date(date2);
    if(d1!=undefined&&d2!=undefined){
      return Math.abs((d2.getMonth() - d1.getMonth())+(d2.getFullYear() - d1.getFullYear())*12);
    }else{
      return null;
    }
    
  }

  gotoSite(webSite:string){
    if(webSite!=undefined){
      location.href=webSite;
    }
  }

}