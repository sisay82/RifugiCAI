import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IContacts, IOpening } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

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
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
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


  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
     let contactSub=this.shelterService.getShelterSection(params['id'],"contacts").subscribe(shelter=>{
      this.contacts=shelter.contacts;
      let timeSub=this.shelterService.getShelterSection(params['id'],"openingTime").subscribe(shel=>{
        this.openings=shel.openingTime;
        if(timeSub!=undefined){
          timeSub.unsubscribe();
        }
        if(contactSub!=undefined){
          contactSub.unsubscribe();
        }
        if(routeSub!=undefined){
          routeSub.unsubscribe();
        }
      });
     });
    });
  }
}