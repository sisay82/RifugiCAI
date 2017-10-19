import {
  Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter,IEconomy, IContribution, IFile } from '../../../app/shared/types/interfaces'
import { Enums } from '../../../app/shared/types/enums'
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
  activeYear;
  activeTab:IEconomy;
  balanceSheet:number=0;
  files:IFile[]=[];
  revenuesFiles:[IFile]=[] as [IFile];
  outgosFiles:[IFile]=[] as [IFile];
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

  getContributionSumPerType(type:Enums.Contribution_Type){
    let total:any=0;
    this.revenuesFiles.concat(
      this.files.filter(obj=>obj.type==Enums.File_Type.contribution)
    ).filter(obj=>obj.contribution_type==type&&obj.invoice_year==this.activeYear).forEach((file)=>{
      total+=this.getTotal(file.value,file.invoice_tax);
    });
    return total;
  }

  changeActiveTab(year,newTab:IEconomy){
    this.activeYear=year;
    if(newTab){
      this.activeTab=newTab;
    }else{
      this.activeTab={year:year};
    }
    this.setBalanceSheetByYear(year);
  }

  getTotal(value,tax){
    if(tax){
      if(tax>1){
        return (value*(tax/100))+value;
      }else{
        return (value*tax)+value;
      }
    }else{
      return value;
    }
    
  }

  getEnumNames(){
      let names:any[]=[];
      const objValues = Object.keys(Enums.Contribution_Type).map(k => Enums.Contribution_Type[k]);
      objValues.filter(v => typeof v === "string").forEach((val)=>{
          names.push(val);
      });
      return names;
  }

  setBalanceSheetByYear(year){
    let total:number=0;
    let totRevenues:number=0;
    let totOutgos:number=0;
    this.outgosFiles.filter(obj=>obj.invoice_year==year).forEach(entry=>{
      let n=0;
      n=this.getTotal(entry.value,entry.invoice_tax);
      totOutgos+=<number>n;
    });
    this.revenuesFiles.filter(obj=>obj.invoice_year==year).forEach(entry=>{
      let n=0;
      n=this.getTotal(entry.value,entry.invoice_tax);
      totRevenues+=<number>n;
    });
    this.outgos=totOutgos;
    this.revenues=totRevenues;
    total=totRevenues-totOutgos;
    this.balanceSheet=total;
    return total;
  }

  analyzeDocsYear(files:IFile[]):Promise<any>{
    return new Promise<any>((resolve,reject)=>{
      files.forEach(file=>{
        if(!this.economy.find(obj=>obj.year==file.invoice_year)){
          this.economy.push({year:file.invoice_year,accepted:false,confirm:false});
        }
        
      });
      this.economy=this.economy.sort((a,b)=>{return a.year < b.year ? -1 : a.year > b.year ? +1 : 0;})
      resolve()
    });
  }

  getFilesByYear(files:any[]):any[]{    
    return files.filter(obj=>obj.invoice_year==this.activeYear);
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
            resolve(files.filter(obj=>obj.type==Enums.File_Type.invoice||obj.type==Enums.File_Type.contribution));
          });
        }else{
          resolve(files.filter(obj=>obj.type==Enums.File_Type.invoice||obj.type==Enums.File_Type.contribution));
        }
        if(loadServiceSub!=undefined){
          loadServiceSub.unsubscribe();
        }
      });
      this.detailsService.onChildLoadFilesRequest([Enums.File_Type.invoice,Enums.File_Type.contribution]);
    });
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
        this.getDocs(params["id"])
        .then(files=>{
          this.analyzeDocsYear(files)
          .then(()=>{
            if(routeSub!=undefined){
              routeSub.unsubscribe();
            }
          });
          this.files=files;
          this.revenuesFiles=files.filter(obj=>Enums.Invoice_Type[obj.invoice_type]==Enums.Invoice_Type.Attività.toString()) as [IFile];
          this.outgosFiles=files.filter(obj=>Enums.Invoice_Type[obj.invoice_type]==Enums.Invoice_Type.Passività.toString()) as [IFile];
          this.setBalanceSheetByYear((new Date()).getFullYear());
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