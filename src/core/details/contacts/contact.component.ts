import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IContacts, IOpening } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {BcDetailsService} from '../details.service'

@Component({
  moduleId: module.id,
  selector: 'bc-contacts',
  templateUrl: 'contact.component.html',
  styleUrls: ['contact.component.scss'],
  providers:[ShelterService]
})
export class BcContact {
  contacts:IContacts={name:null,role:null};
  openings:IOpening[]=[];
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="contacts";
    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){

  }

  gotoSite(webSite:string){
    if(webSite!=undefined){
      location.href=webSite;
    }
  }

  getOpening(id):Promise<IOpening[]>{
    return new Promise<IOpening[]>((resolve,reject)=>{
        let revSub=this.detailsService.load$.subscribe(shelter=>{
            if(shelter!=null&&shelter.openingTime!=undefined){
                if(revSub!=undefined){
                    revSub.unsubscribe();
                }
                resolve(shelter.openingTime);
            }else{
                let openSub=this.shelterService.getShelterSection(id,"openingTime").subscribe(shelter=>{
                    if(shelter.openingTime==undefined) shelter.openingTime=[] as [IOpening];
                    this.detailsService.onChildSave(shelter,"openingTime");
                    if(openSub!=undefined){
                        openSub.unsubscribe();
                    }
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter.openingTime);
                });
            }
        });
        this.detailsService.onChildLoadRequest("openingTime");
    });
 }

 getContact(id):Promise<IContacts>{
    return new Promise<IContacts>((resolve,reject)=>{
        let revSub=this.detailsService.load$.subscribe(shelter=>{
            if(shelter!=null&&shelter.contacts!=undefined){
                if(revSub!=undefined){
                    revSub.unsubscribe();
                }
                resolve(shelter.contacts);
            }else{
                let contSub=this.shelterService.getShelterSection(id,"contacts").subscribe(shelter=>{
                    if(shelter.contacts==undefined) shelter.contacts={};
                    this.detailsService.onChildSave(shelter,"contacts");
                    if(contSub!=undefined){
                        contSub.unsubscribe();
                    }
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter.contacts);
                });
            }
        });
        this.detailsService.onChildLoadRequest("contacts");
    });
 }

  initContacts(contacts:IContacts,openings:IOpening[]){
    this.contacts=contacts;
    this.openings=openings;
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getContact(params["id"])
      .then((contacts)=>{
          this.getOpening(params["id"])
          .then((openings)=>{
              this.initContacts(contacts,openings);
              if(routeSub!=undefined){
                  routeSub.unsubscribe();
              }
          });
      });
    });
  }
}