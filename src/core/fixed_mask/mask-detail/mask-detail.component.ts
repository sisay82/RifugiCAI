import {
  Component, Input,OnInit,OnChanges,SimpleChanges
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {BcAuthService} from '../../../app/shared/auth.service';

@Component({
    moduleId: module.id,
    selector: 'bc-mask-detail',
    templateUrl: 'mask-detail.component.html',
    styleUrls: ['mask-detail.component.scss'],
    providers:[ShelterService]
})
export class BcMask {
  @Input() shelter:IShelter;
  private revisionPermission:Boolean=false;
  private shelterInitialized:Boolean=false;
  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService,private authService:BcAuthService){
    
  }

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

  ngOnChanges(changes: SimpleChanges) {
    if(!this.shelterInitialized&&this.shelter!=undefined){
      this.shelterInitialized=true;
      let permissionSub = this.authService.checkRevisionPermission(this.shelter.idCai).subscribe(val=>{
        this.revisionPermission=val;
        if(permissionSub!=undefined){
          permissionSub.unsubscribe();
        }
      });
    }
  }
}