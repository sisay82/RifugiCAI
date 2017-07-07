import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IContacts, IOpening } from '../../../app/shared/types/interfaces';
import {ShelterService} from '../../../app/shelter/shelter.service';
import {BcSharedService} from '../../../app/shelter/shelterPage/shared.service';
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
  activeComponentSub:Subscription;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    this.activeComponentSub=this.shared.activeComponentRequest$.subscribe(()=>{
      this.shared.onActiveComponentAnswer("contacts");
    })

    this.shared.onActiveOutletChange("content");
  }

  ngOnDestroy(){
    this.activeComponentSub.unsubscribe();
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
     let contactSub=this.shelterService.getShelterSection(params['id'],"contacts").subscribe(shelter=>{
      this.contacts=shelter.contacts;
      let timeSub=this.shelterService.getShelterSection(params['id'],"openingTime").subscribe(shel=>{
        this.openings=shel.openingTime;
        timeSub.unsubscribe();
        contactSub.unsubscribe();
        routeSub.unsubscribe();
      });
     });
    });
  }
}