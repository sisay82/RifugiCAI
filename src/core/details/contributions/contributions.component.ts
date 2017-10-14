import {
  Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter,IContribution,IFileRef } from '../../../app/shared/types/interfaces'
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
  selector: 'bc-contributions',
  templateUrl: 'contributions.component.html',
  styleUrls: ['contributions.component.scss'],
  providers:[ShelterService]
})
export class BcContributions {
  activeYear:Number;
  activeTab:IContribution;
  data:{year:Number,contributions:[IContribution]}[]=<any>[];
  
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="contribution";
    this.shared.onActiveOutletChange("content");
  }

  isActive(year){
    return year==this.activeYear;
  }

  showTab(year){
    if(year!=this.activeYear){
      this.changeActiveTab(year,this.data.find(obj=>obj.year==year));
    }
  }

  changeActiveTab(year,newTab:IContribution){
    this.activeYear=year;
    if(newTab){
      this.activeTab=newTab;
    }else{
      this.activeTab={year:year};
    }
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

  groupByYear(list:IContribution[]):{year:Number,contributions:[IContribution]}[]{
    let result = list.reduce(function (r, a) {
      r[<any>a.year] = r[<any>a.year] || [];
      r[<any>a.year].push(a);
      return r;
    }, Object.create(null));
    let ret:{year:Number,contributions:[IContribution]}[]=[];
    for(let y in result){
      ret.push({year:new Number(y),contributions:result[y]});
    }
    return ret;
  }

  downloadFile(pdf:IFileRef){
    if(pdf&&pdf.id){
      let queryFileSub=this.shelterService.getFile(pdf.id).subscribe(file=>{
        var e = document.createEvent('MouseEvents');
        let data=Buffer.from(file.data);
        let blob=new Blob([data],{type:"application/pdf"});
        let a = document.createElement('a');
        a.download = <string>file.name;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["application/pdf", a.download, a.href].join(':');
        e.initEvent('click', true, false);
        a.dispatchEvent(e);
      });
    }
  }

  ngOnInit() {
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getContributions(params["id"])
      .then(shelter=>{
        this.data=this.groupByYear(shelter.contributions);
        let tab;
        let year:Number;
        year=(new Date()).getFullYear();        
        if(shelter.contributions&&shelter.contributions.length>0){
          tab={year:year,contributions:shelter.contributions.filter(obj=>obj.year==(new Date().getFullYear()))};   
        }else{
          let contr:IContribution={year:(new Date()).getFullYear()}
          this.data=[{year:year,contributions:[contr]}];
        }
        this.changeActiveTab(year,tab);
      });
    });
  }
}