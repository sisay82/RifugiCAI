import {
  Component, Input
} from '@angular/core';
import { IShelter } from '../../../shared/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shelter/shared.service'

@Component({
    moduleId: module.id,
    selector: 'bc-mask-revision',
    templateUrl: 'mask-revision.component.html',
    styleUrls: ['mask-revision.component.scss'],
    providers:[ShelterService]
})
export class BcMaskRevision {
  @Input() shelter:IShelter;

  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService){

  }

  save(){
    /*this.shelterService.confirmShelter(this.shelter._id).subscribe(value=>{
      if(!value){
       console.log("Error in Confirm"); 
      }else{
        this.shared.activeComponentAnswer$.subscribe(component=>{
          this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(revision:"+component+")")
        })
        this.shared.onActiveComponentRequest();
      }
    });*/
    this.shared.onActiveOutletChange("content");
  }

  return(){
    this.router.navigateByUrl("list");
  }
}