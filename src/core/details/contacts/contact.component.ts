import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IContacts } from '../../../app/shared/types/interfaces'
import {ShelterService} from '../../shelter/shelter.service'

@Component({
  moduleId: module.id,
  selector: 'bc-contacts',
  templateUrl: 'contact.component.html',
  styleUrls: ['contact.component.scss'],
  providers:[ShelterService]
})
export class BcContact {
  data:IContacts;

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}


  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.data=this.shelterService.getContactsByName(params['name']);
    });
  }
}