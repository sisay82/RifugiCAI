import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagement,ISubject } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Pipe({name: 'prefixPipe'})
export class PrefixPipe implements PipeTransform {
    public transform(input:string): string{
        if (!input) {
            return '----';
        } else {
            return "+39"+input;
        }
    }
    
}

@Pipe({name: 'formatdate'})
export class FormatDate implements PipeTransform {
    public transform(input:number): string{
        if (!input) {
          return '----';
        } else {
          let year:any=0;
          let month:any=Math.trunc(input%12);
          year=Math.trunc(input/12);
          if(year>0){
            return year+" anni, "+month+" mesi";
          }else{
            return month+" mesi";
          }
        }
    }
}

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

  getValue(){
    return Object.keys(Enums.Custody_Type).find(k=>Enums.Custody_Type[k]===this.data.rentType)
  }

}