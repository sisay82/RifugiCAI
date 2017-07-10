import {
  Component, Input,OnInit
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shared/shared.service';
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

  toggleMenu(){
    this.shared.onToggleMenu();
  }

  checkWinPlatform(){
    return (navigator.userAgent.toLowerCase().indexOf("win")==-1);
  }

  revision(){
    let component = this.shared.activeComponent;
    this.shared.onActiveOutletChange("revision");
    this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(revision:"+component+")");
  }

  return(){
    this.router.navigateByUrl("list");
  }

  getRegionalType(value){
    if(value==undefined){
      return '----';
    }else{
      return Object.keys(Enums.Regional_Type).find(k=>Enums.Source_Type[k]===value);
    }
  }

  ngOnInit(){
    if(this.shelter==undefined){
      let routeSub=this._route.params.subscribe(params=>{
        let shelSub=this.shelterService.getShelter(params['id']).subscribe(shelter=>{
            this.shelter=shelter;
            routeSub.unsubscribe();
            shelSub.unsubscribe();
        });
      });
    }
  }
}