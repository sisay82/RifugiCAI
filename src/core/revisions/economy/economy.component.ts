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
import {BcRevisionsService} from '../revisions.service';
import {RevisionBase} from '../shared/revision_base';

@Directive({
selector:"div[active]",
host:{
    "[class.bc-tab-active]":"active"
  }
})
export class BcActiveTabStyler{
  @Input("active") active:boolean=false;
}

@Directive({
selector:"div[disabled]",
host:{
    "[class.disabled]":"disabled"
  }
})
export class BcDisableDivStyler{
  @Input("disabled") disabled:boolean=false;
}

@Component({
moduleId: module.id,
selector: 'bc-economy',
templateUrl: 'economy.component.html',
styleUrls: ['economy.component.scss'],
providers:[ShelterService]
})
export class BcEconomyRevision extends RevisionBase{
  economy:[IEconomy]=<any>[];
  contributions:[IContribution]=<any>[];
  activeYear;
  maskSaveSub:Subscription;
  name:String;
  activeTab:IEconomy;
  balanceSheet:number=0;
  revenuesFiles:[IFile]=[] as [IFile];
  outgosFiles:[IFile]=[] as [IFile];
  revenues:number=0;
  outgos:number=0;
  statusChange:boolean=false;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private revisionService:BcRevisionsService){
    super(shelterService,shared,revisionService);

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
      this.disableSave=true;
      this.save(true);    
    });

    shared.activeComponent="economy";
    this.shared.onActiveOutletChange("revision");
  }

  isDisabled(){
    return this.activeTab.confirm;
  }

  save(confirm){
    if(this.statusChange){
      let shelter:IShelter={_id:this._id,name:this.name};
      shelter.economy=this.economy;
      this.revisionService.onChildSave(shelter,"economy");
      let shelSub=this.shelterService.preventiveUpdateShelter(shelter,"economy").subscribe((returnVal)=>{
          if(returnVal){
              this.displayError=false;
              if(confirm){
                  this.shared.onMaskConfirmSave("economy");
              }
          }else{
              console.log("Err "+returnVal);
              this.displayError=true;
          }
          if(shelSub!=undefined){
              shelSub.unsubscribe();
          }
      });
      
    }else{
      if(confirm){
        this.shared.onMaskConfirmSave("economy");
      }
    }
  }

  checkValidForm(){
    return true;
  }

  confirmEconomy(year){
    this.statusChange=true;
    this.disableSave=true;
    this.economy.find(obj=>obj.year==this.activeYear).confirm=true;
    let i=0;
    let files:IFile[]=this.revenuesFiles.filter(obj=>obj.invoice_year==this.activeYear).concat(this.outgosFiles.filter(obj=>obj.invoice_year==this.activeYear))
    if(files.length>0){
      for(let file of files){
        file.invoice_confirmed=true;
        file.shelterId=this._id;
        this.shelterService.updateFile(file).subscribe((val)=>{
          if(val){
            i++;
            if(files.length==i){
              this.shared.onSendMaskSave();
            }
          }
        });
        this.revisionService.onChildSaveFile(file);
      }
    }else{
      this.shared.onSendMaskSave();
    }
    
  }

  checkPermissions(){
    return true;
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
    this.setBalanceSheetByYear(year);
  }

  getTotal(value,tax){
    if(tax>1){
      return (value*(tax/100))+value;
    }else{
      return (value*tax)+value;
    }
  }

  ngOnDestroy(){
    if(!this.disableSave){
        this.save(false);
    }
    if(this.maskSaveSub!=undefined){
        this.maskSaveSub.unsubscribe();
    }
    if(this.maskInvalidSub!=undefined){
        this.maskInvalidSub.unsubscribe();
    }
    if(this.maskValidSub!=undefined){
        this.maskValidSub.unsubscribe();
    }  
  }

  setBalanceSheetByYear(year){
    let total:number=0;
    let totRevenues:number=0;
    let totOutgos:number=0;
    this.outgosFiles.filter(obj=>obj.invoice_year==year).forEach(entry=>{
      totOutgos+=<number>entry.value;
    });
    this.revenuesFiles.filter(obj=>obj.invoice_year==year).forEach(entry=>{
      totRevenues+=<number>entry.value;
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
          this.economy.push({year:file.invoice_year,confirm:false});
        }
        
      });
      this.economy=this.economy.sort((a,b)=>{return a.year < b.year ? -1 : a.year > b.year ? +1 : 0;})
      resolve()
    });
  }

  getDocs(shelId):Promise<IFile[]>{
    return new Promise<IFile[]>((resolve,reject)=>{
      let loadServiceSub=this.revisionService.loadFiles$.subscribe(files=>{
        if(!files){
          let queryFileSub=this.shelterService.getFilesByShelterId(shelId).subscribe(files=>{
            this.revisionService.onChildSaveFiles(files);
            if(queryFileSub!=undefined){
              queryFileSub.unsubscribe();
            }
            resolve(files.filter(obj=>obj.type==Enums.File_Type.invoice));
          });
        }else{
          resolve(files.filter(obj=>obj.type==Enums.File_Type.invoice));
        }
        if(loadServiceSub!=undefined){
          loadServiceSub.unsubscribe();
        }
      });
      this.revisionService.onChildLoadFilesRequest([Enums.File_Type.invoice]);
    });
  }

  getEconomy(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.revisionService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.economy!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"economy").subscribe(shelter=>{
                this.revisionService.onChildSave(shelter,"economy");
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
      this.revisionService.onChildLoadRequest("economy");
    });
  }

  getContributions(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.revisionService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.contributions!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"contributions").subscribe(shelter=>{
                this.revisionService.onChildSave(shelter,"contributions");
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
      this.revisionService.onChildLoadRequest("contributions");
    });
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this._id=params["id"]      
      this.getEconomy(params["id"])
      .then((shelter)=>{
        this.name=shelter.name;
        this.getDocs(params["id"])
        .then(files=>{
            this.getContributions(params["id"])
            .then(shel=>{
            this.contributions=shel.contributions.filter(obj=>obj.accepted) as [IContribution];
            this.analyzeDocsYear(files)
            .then(()=>{
                if(routeSub!=undefined){
                routeSub.unsubscribe();
                }
            })
            });
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