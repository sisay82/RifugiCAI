import {
  Component, Input,OnDestroy
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {BcSharedService} from '../../app/shelter/shelterPage/shared.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask-controller.component.html'
})
export class BcMaskController {
  @Input() shelter:IShelter;
  @Input() ref:string;
  currentOutlet:string="none";
  activeOutletRequestSub:Subscription;
  activeOutletSub:Subscription;
  constructor(private shared:BcSharedService,private route:ActivatedRoute){
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
      this.currentOutlet=outlet;
    });

    this.activeOutletRequestSub=shared.activeOutletRequest$.subscribe(()=>{
      shared.onActiveOutletAnswer(this.currentOutlet);
    });
  }

  ngOnDestroy(){
    if(this.activeOutletSub!=undefined){
      this.activeOutletSub.unsubscribe();
    }
    if(this.activeOutletRequestSub!=undefined){
      this.activeOutletRequestSub.unsubscribe();
    }
  }
}