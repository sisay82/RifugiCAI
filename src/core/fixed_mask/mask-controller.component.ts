import {
  Component, Input,OnDestroy,ViewEncapsulation
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask-controller.component.html',
    styleUrls:['mask-controller.component.scss'],
    encapsulation:ViewEncapsulation.None
})
export class BcMaskController {
  @Input() shelter:IShelter;
  @Input() ref:string;
  currentOutlet:string="";
  activeOutletSub:Subscription;
  constructor(private shared:BcSharedService,private route:ActivatedRoute){
    this.currentOutlet=shared.activeOutlet;
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
        this.currentOutlet=outlet;
    });
  }

  ngOnDestroy(){
      this.activeOutletSub.unsubscribe();
  }
}