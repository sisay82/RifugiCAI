import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagement,ISubject } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'bc-manage',
  templateUrl: 'manage.component.html',
  styleUrls: ['manage.component.scss'],
  providers:[ShelterService]
})
export class BcManage {
  data:IManagement={rent:null,period:null,subject:[{name:null}]};
  owner:ISubject;
  managers:ISubject[]=[];
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    shared.activeComponent="management";
    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      let shelSub=this.shelterService.getShelterSection(params['id'],"management").subscribe(shelter=>{
        this.data=shelter.management;
        if(this.data!=undefined&&this.data.subject!=undefined){
          this.data.subject.forEach(subject=>{
            if(subject.type!=undefined&&subject.type.toLowerCase().indexOf("proprietario")>-1){
              this.owner=subject;
            }else{
              this.managers.push(subject);
            }
          })
        }
        if(shelSub!=undefined){
          shelSub.unsubscribe();
        }
        if(routeSub!=undefined){
          routeSub.unsubscribe();
        }
      })
    });
  }

  gotoSite(webSite:string){
    if(webSite!=undefined){
      location.href=webSite;
    }
  }

  getValue(){
    if(this.data!=undefined&&this.data.rentType!=undefined){
      return Object.keys(Enums.Custody_Type).find(k=>Enums.Custody_Type[k]===this.data.rentType);
    }
  }

}