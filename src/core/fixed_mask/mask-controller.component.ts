import {
  Component, Input,OnDestroy
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {BcSharedService} from '../../app/shared/shared.service';
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
  activeOutletSub:Subscription;
  constructor(private shared:BcSharedService,private route:ActivatedRoute){
    this.currentOutlet=shared.activeOutlet;
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
      this.currentOutlet=outlet;
    });
  }

  ngOnDestroy(){
    if(this.activeOutletSub!=undefined){
      this.activeOutletSub.unsubscribe();
    }
  }
}