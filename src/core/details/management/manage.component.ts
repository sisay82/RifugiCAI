import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAdministrative } from '../../../shared/interfaces'
import {ShelterService} from '../../shelter/shelter.service'

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcManage {
  data:IAdministrative;

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.data=this.shelterService.getAdminByName(params['name']);

    });
  }

}