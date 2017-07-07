import {
  Component, Input,OnInit
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shelter/shelterPage/shared.service'
import { Subscription } from 'rxjs/Subscription';

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
    const activeComponentSub=this.shared.activeComponentAnswer$.subscribe(component=>{
      this.shared.onActiveOutletChange("revision");
      this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(revision:"+component+")");
      activeComponentSub.unsubscribe();
    })
    this.shared.onActiveComponentRequest();
  }

  return(){
    this.router.navigateByUrl("list");
  }

  ngOnInit(){
    if(this.shelter==undefined){
      let routeSub=this._route.params.subscribe(params=>{
        let shelSub=this.shelterService.getShelter(params['id']).subscribe(shelter=>{
            this.shelter=shelter;
            routeSub.unsubscribe();
            shelSub.unsubscribe();
        });
        //
      });
    }
  }
}