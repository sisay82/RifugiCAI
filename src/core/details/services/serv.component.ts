import {
  Component,Input,OnInit
} from '@angular/core';
import { IService ,ITag,IShelter} from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { ActivatedRoute,Router } from '@angular/router';
import {BcSharedService,ServiceBase} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { BcDetailsService } from '../details.service';
import { Enums } from '../../../app/shared/types/enums';
import { DetailBase } from '../shared/detail_base';

@Component({
  moduleId: module.id,
  selector: 'bc-serv',
  templateUrl: 'serv.component.html',
  styleUrls: ['serv.component.scss'],
  providers:[ShelterService]
})
export class BcServ extends DetailBase{
  services:IService[]=[];
  activeComponentSub:Subscription;
  constructor(private shelterService:ShelterService,_route:ActivatedRoute,shared:BcSharedService,router:Router,private detailsService:BcDetailsService){
    super(_route,shared,router);
    shared.activeComponent=Enums.Routed_Component.services;
  }


  initServices(services){
    let serviceList=new ServiceBase();
    if(!services){
      services=[];
    }
    for(let category of Object.getOwnPropertyNames(serviceList)){
        let s:IService={}
        s.category=category;
        s.tags=[] as [ITag];
        let serv=services.find(obj=>obj.category&&obj.category==s.category);
        for(let service of Object.getOwnPropertyNames(serviceList[category])){
            let tag={key:service,value:null,type:typeof(serviceList[category][service])};
            if(serv!=undefined){
                s._id=serv._id;
                let t=serv.tags.find(obj=>obj.key==tag.key);
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

  init(shelId){
    this.getService(shelId)
    .then(shelter=>{
        this.initServices(shelter.services);
    });
  }
  
}