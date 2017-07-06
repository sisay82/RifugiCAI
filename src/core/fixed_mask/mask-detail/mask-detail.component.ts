import {
  Component, Input
} from '@angular/core';
import { IShelter } from '../../../shared/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shelter/shared.service'

@Component({
    moduleId: module.id,
    selector: 'bc-mask-detail',
    templateUrl: 'mask-detail.component.html',
    styleUrls: ['mask-detail.component.scss'],
    providers:[ShelterService]
})
export class BcMask {
  @Input() shelter:IShelter;

  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService){}

  revision(){
    //this.shared.activeComponentAnswer$.subscribe(component=>{
      this.shared.onActiveOutletChange("revision");
      //this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(revision:"+component+")");
    //})
    //this.shared.onActiveComponentRequest();
  }

  return(){
    this.router.navigateByUrl("list");
  }
}