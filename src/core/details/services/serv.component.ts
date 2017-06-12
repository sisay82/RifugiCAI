import {
  Component,Input,OnInit
} from '@angular/core';
import { IService } from '../../../shared/interfaces'
import {ShelterService} from '../../shelter/shelter.service'
import { ActivatedRoute } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'bc-serv',
  templateUrl: 'serv.component.html',
  styleUrls: ['serv.component.scss'],
  providers:[ShelterService]

})
export class BcServ {
  services:IService[];

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}


  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.services=this.shelterService.getServByName(params['name']);
    });
  }


}