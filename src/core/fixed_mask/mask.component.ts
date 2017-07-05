import {
  Component, Input
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../app/shelter/shelter.service'

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask.component.html',
    styleUrls: ['mask.component.scss'],
    providers:[ShelterService]
})
export class BcMask {
  @Input() shelter:IShelter;
  @Input() ref:string;

  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService){}

  isRevisionig(){
    let route=this._route;
    while(route.children.length>0){
      route=route.children[0];
    }
    return (route.outlet.toLowerCase().indexOf("revision")>-1);
  }

  save(){
    this.shelterService.confirmShelter(this.shelter._id,true).subscribe(value=>{
      if(!value){
       console.log("Error in Confirm"); 
      }else{
        let route=this._route;
        while(route.children.length>0){
          route=route.children[0];
        }
        let path=route.snapshot.url[0].path;
        this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+path+")")
      }
    });
  }

  cancel(){
    this.shelterService.confirmShelter(this.shelter._id,false).subscribe(value=>{
      if(!value){
       console.log("Error in Confirm"); 
      }else{
        let route=this._route;
        while(route.children.length>0){
          route=route.children[0];
        }
        let path=route.snapshot.url[0].path;
        this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+path+")")
      }
    });
  }

  revision(){
    let route=this._route;
    while(route.children.length>0){
      route=route.children[0];
    }
    let path=route.snapshot.url[0].path;
    this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(revision:"+path+")")
  }

  return(){
    if(this.ref!=undefined)
      this.router.navigateByUrl(this.ref);
    else this.router.navigateByUrl("list");
  }
}