import {
  Component, Input, OnInit
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcSharedService } from '../../../app/shelter/shelterPage/shared.service';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask.component.html',
    styleUrls: ['mask.component.scss'],
    providers:[ShelterService]
})
export class BcMask {
  @Input() shelter:IShelter;

  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService){
  }

  ngOnInit(){
    if(this.shelter==undefined){
      this._route.params.subscribe(params=>{
        this.shelterService.getShelter(params['id']).subscribe(shelter=>{
            this.shelter=shelter;
        });
      });
    }
  }

  isRevisionig(){
    let route=this._route;
    while(route.children.length>0){
      route=route.children[0];
    }
    return (route.outlet.toLowerCase().indexOf("revision")>-1);
  }

  save(){
    this.shared.maskConfirmSave$.subscribe((obj)=>{
      if(obj.dirty){
        this.shelterService.confirmShelter(this.shelter._id,true).subscribe(value=>{
          if(!value){
          console.log("Error in Confirm"); 
          }else{
            this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+obj.component+")")
          }
        });
      }else{
        this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+obj.component+")");
      }
    });
    this.shared.onMaskSave();
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
    this.router.navigateByUrl("list");
  }
}