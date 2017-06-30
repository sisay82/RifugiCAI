import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IContacts, IOpening } from '../../../app/shared/types/interfaces'
import {ShelterService} from '../../../app/shelter/shelter.service'

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
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}


  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
     this.shelterService.getShelterSection(params['id'],"contacts").subscribe(shelter=>{
      this.contacts=shelter.contacts;
      this.shelterService.getShelterSection(params['id'],"openingTime").subscribe(shel=>{
        this.openings=shel.openingTime;
      });
     });
    });
  }

  gotoSite(webSite:string){
    location.replace(webSite);
  }
}