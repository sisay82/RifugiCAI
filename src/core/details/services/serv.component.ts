import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { IService ,ITag,IShelter} from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { ActivatedRoute } from '@angular/router';
import {BcSharedService,ServiceBase} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { BcDetailsService } from '../details.service';

@Component({
  moduleId: module.id,
  selector: 'bc-serv',
  templateUrl: 'serv.component.html',
  styleUrls: ['serv.component.scss'],
  providers:[ShelterService]
})
export class BcServ {
  services:IService[]=[];
  activeComponentSub:Subscription;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="services";
    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }

  toTitleCase(input:string): string{
    if (!input) {
        return '';
    } else {
        return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1) )).replace(/_/g," ");
    }
  }

  initServices(services){
    let serviceList=new ServiceBase();
    if(!services){
      services=[];
    }
    for(let category of Object.getOwnPropertyNames(serviceList)){
        let s:IService={}
        s.category=this.toTitleCase(category);
        s.tags=[] as [ITag];
        let serv=services.find(obj=>obj.category&&obj.category.toLowerCase().indexOf(s.category.toLowerCase())>-1);
        for(let service of Object.getOwnPropertyNames(serviceList[category])){
            let tag={key:this.toTitleCase(service),value:null,type:typeof(serviceList[category][service])};
            if(serv!=undefined){
                s._id=serv._id;
                let t=serv.tags.find(obj=>obj.key.toLowerCase().indexOf(tag.key.toLowerCase())>-1);
                if(t!=undefined){
                    tag.value=t.value;
                }
            }
            s.tags.push(tag);
        }
        this.services.push(s);
    }
  }

  getService(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let detSub=this.detailsService.load$.subscribe(shelter=>{
            if(shelter!=null&&shelter.services!=undefined){
                if(detSub!=undefined){
                    detSub.unsubscribe();
                }
                resolve(shelter);
            }else{
                let shelSub=this.shelterService.getShelterSection(id,"services").subscribe(shelter=>{
                    if(shelter.services==undefined) shelter.services=[] as [IService];
                    this.detailsService.onChildSave(shelter,"services");
                    if(shelSub!=undefined){
                        shelSub.unsubscribe();
                    }
                    if(detSub!=undefined){
                        detSub.unsubscribe();
                    }
                    resolve(shelter);
                });
            }
        });
        this.detailsService.onChildLoadRequest("services");
    });
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getService(params["id"])
      .then(shelter=>{
          this.initServices(shelter.services);
          if(routeSub!=undefined){
              routeSub.unsubscribe();
          }
      });
    });
  }
  
}