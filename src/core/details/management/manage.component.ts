import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAdministrative } from '../../../shared/interfaces'
import {ShelterService} from '../../shelter/shelter.service'
import { Enums } from '../../../shared/enums'

@Component({
  moduleId: module.id,
  selector: 'bc-manage',
  templateUrl: 'manage.component.html',
  styleUrls: ['manage.component.scss'],
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

  getValue(){
    return Object.keys(Enums.Custody_Type).find(k=>Enums.Custody_Type[k]===this.data.custody_type)
  }

}