import {
  Component, Input
} from '@angular/core';
import { IShelter } from '../../shared/interfaces';
import {Router,ActivatedRoute} from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask.component.html',
    styleUrls: ['mask.component.scss'],
})
export class BcMask {
  @Input() shelter:IShelter;
  @Input() ref:string;

  constructor(private router:Router,private _route:ActivatedRoute){}

  isRevisionig(){
    return (this._route.outlet.toLowerCase().indexOf("revision")>-1);
    //return true;
  }

  save(){
    
  }

  revision(){
    console.log(this._route.root);
    //this.router.navigate([{outlets:({'content': ['geographic']})}],{relativeTo:this._route.root})
  }

  return(){
    if(this.ref!=undefined)
      this.router.navigateByUrl(this.ref);
    else this.router.navigateByUrl("list");
  }
}