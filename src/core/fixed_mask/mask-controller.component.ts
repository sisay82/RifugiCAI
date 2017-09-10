import {
  Component, Input,OnDestroy,OnInit
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import { Enums } from '../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {ShelterService} from '../../app/shelter/shelter.service'
import {BcAuthService} from '../../app/shared/auth.service';

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask-controller.component.html',
    providers:[ShelterService]
})
export class BcMaskController {
  @Input() shelter:IShelter;
  @Input() ref:string;
  _id:String;
  currentOutlet:string="none";
  activeOutletSub:Subscription;
  shelIdRequest:Subscription;
  revisionPermission:Enums.User_Type;
  constructor(private shared:BcSharedService,private route:ActivatedRoute,private shelterService:ShelterService,private authService:BcAuthService){
    this.currentOutlet=shared.activeOutlet;
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
      if(this.currentOutlet=='revision'&&outlet=='content'){
        let shelSub=this.shelterService.getShelter(this._id).subscribe(shelter=>{
          this.shelter=shelter;
          let permissionSub = this.authService.checkRevisionPermissionForShelter(shelter.idCai).subscribe(val=>{
            this.revisionPermission=val;
            if(permissionSub!=undefined){
              permissionSub.unsubscribe();
            }
          });
          if(shelSub!=undefined){
            shelSub.unsubscribe();
          }
        });
      }
      this.currentOutlet=outlet;
    });
  }

  ngOnInit(){
    if(this.shelter==undefined){
      let routeSub=this.route.params.subscribe(params=>{
        this._id=params['id'];

        let shelSub=this.shelterService.getShelter(params['id']).subscribe(shelter=>{
          this.shelIdRequest = this.authService.shelIdRequest$.subscribe(()=>{
            this.authService.onShelId(shelter.idCai);
          });

          this.shelter=shelter;
          let permissionSub = this.authService.checkRevisionPermissionForShelter(shelter.idCai).subscribe(val=>{
            this.revisionPermission=val;
            if(permissionSub!=undefined){
              permissionSub.unsubscribe();
            }
            if(routeSub!=undefined){
              routeSub.unsubscribe();
            }
            if(shelSub!=undefined){
              shelSub.unsubscribe();
            }

          });
          
        });
      });
    }
  }

  ngOnDestroy(){
    if(this.activeOutletSub!=undefined){
      this.activeOutletSub.unsubscribe();
    }
    if(this.shelIdRequest!=undefined){
      this.shelIdRequest.unsubscribe();
    }
  }
}