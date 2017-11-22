import {
  Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter,IContribution,IFileRef,IFile } from '../../../app/shared/types/interfaces';
import {Enums } from '../../../app/shared/types/enums';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {BcSharedService} from '../../../app/shared/shared.service'
import {BcDetailsService} from '../details.service';

@Directive({
  selector:"div[active]",
  host:{
    "[class.bc-detail-contributions-tab-active]":"active"
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
  activeTab:{year:Number,contributions:IFile[]};
  data:{year:Number,contributions:IFile[]}[]=<any>[];
  
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="contribution";
    this.shared.onActiveOutletChange("content");
  }

  isActive(year){
    return year==this.activeYear;
  }

  showTab(year){
    if(year!=this.activeYear){
      this.changeActiveTab(year);
    }
  }

  changeActiveTab(year){
    this.activeYear=year;
    this.activeTab=this.data.find(obj=>obj.year==year);
  }

  getDocs(shelId):Promise<IFile[]>{
    return new Promise<IFile[]>((resolve,reject)=>{
        let loadServiceSub=this.detailsService.loadFiles$.subscribe(files=>{
            if(!files){
              let queryFileSub=this.shelterService.getFilesByShelterId(shelId).subscribe(files=>{
                  this.detailsService.onChildSaveFiles(files);
                  if(queryFileSub!=undefined){
                      queryFileSub.unsubscribe();
                  }
                  resolve(files.filter(obj=>obj.type==Enums.File_Type.contribution));
              });
            }else{
                resolve(files.filter(obj=>obj.type==Enums.File_Type.contribution));
            }
            if(loadServiceSub!=undefined){
                loadServiceSub.unsubscribe();
            }
        });
        this.detailsService.onChildLoadFilesRequest([Enums.File_Type.contribution]);
    });
}

  groupByYear(list:IFile[]):{year:Number,contributions:IFile[]}[]{
    let result = list.reduce(function (r, a) {
      r[<any>a.invoice_year] = r[<any>a.invoice_year] || [];
      r[<any>a.invoice_year].push(a);
      return r;
    }, Object.create(null));
    let ret:{year:Number,contributions:IFile[]}[]=[];
    for(let y in result){
      ret.push({year:new Number(y),contributions:result[y]});
    }
    return ret;
  }

  downloadFile(id:any){
    if(id){
      let queryFileSub=this.shelterService.getFile(id).subscribe(file=>{
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
      this.getDocs(params["id"])
      .then(files=>{
        this.data=this.groupByYear(files);
        let year:Number;
        year=(new Date()).getFullYear();        
        this.changeActiveTab(year);
      });
    });
  }
}