import {
  Component, Input
} from '@angular/core';
import { IShelter } from '../../shared/interfaces';
import {Router} from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask.component.html',
    styleUrls: ['mask.component.scss']
})
export class BcMask {
  @Input() shelter:IShelter;
  @Input() ref:string;

  constructor(private router:Router){}

  return(){
    if(this.ref!=undefined)
      this.router.navigateByUrl(this.ref);
    else this.router.navigateByUrl("list");
  }
}