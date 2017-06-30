import {
  Component, Input
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
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
    let route=this._route;
    while(route.children.length>0){
      route=route.children[0];
    }
    return (route.outlet.toLowerCase().indexOf("revision")>-1);
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