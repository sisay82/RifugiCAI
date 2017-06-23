import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagement,ISubject } from '../../../app/shared/types/interfaces'
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Enums } from '../../../app/shared/types/enums'

@Component({
  moduleId: module.id,
  selector: 'bc-manage',
  templateUrl: 'manage.component.html',
  styleUrls: ['manage.component.scss'],
  providers:[ShelterService]
})
export class BcManage {
  data:IManagement={subject:[{}]};
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.shelterService.getShelterSection(params['id'],"management").subscribe(shelter=>{
        this.data=shelter.management;
      })
    });
  }

  getValue(){
    if(this.data!=undefined&&this.data.rentType!=undefined){
      return Object.keys(Enums.Custody_Type).find(k=>Enums.Custody_Type[k]===this.data.rentType);
    }
  }

}