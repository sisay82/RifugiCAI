import {
  Component, Input,OnDestroy
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../app/shelter/shelter.service'
import {BcSharedService} from '../../app/shelter/shelterPage/shared.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask-controller.component.html',
    providers:[ShelterService]
})
export class BcMaskController {
  @Input() shelter:IShelter;
  @Input() ref:string;
  currentOutlet:string="content";
  activeOutletSub:Subscription;
  constructor(private shared:BcSharedService,private shelterService:ShelterService,private route:ActivatedRoute){
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
        this.currentOutlet=outlet;
    });
  }

  ngOnDestroy(){
      this.activeOutletSub.unsubscribe();
  }
}