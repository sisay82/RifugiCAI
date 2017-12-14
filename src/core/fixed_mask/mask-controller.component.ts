import {
  Component, Input,OnDestroy,ViewEncapsulation
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import { Enums } from '../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {ShelterService} from '../../app/shelter/shelter.service'
import {BcAuthService} from '../../app/shared/auth.service';
import { validators } from '../inputs/text/text_input.component';

const validObjectIDRegExp = validators.objectID;

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask-controller.component.html',
    styleUrls:['mask-controller.component.scss'],
    encapsulation:ViewEncapsulation.None,
    providers:[ShelterService]
})
export class BcMaskController {
  @Input() shelter:IShelter;
  @Input() ref:string;
  currentOutlet:Enums.Routes.Routed_Outlet;
  _id:String;
  activeOutletSub:Subscription;
  shelIdRequest:Subscription;
  revisionPermission:Enums.Auth_Permissions.User_Type;
  constructor(private shared:BcSharedService,private _route:ActivatedRoute,private router:Router,private shelterService:ShelterService,private authService:BcAuthService){
    this.currentOutlet=shared.activeOutlet;
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
      if(this.currentOutlet==Enums.Routes.Routed_Outlet.revision&&outlet==Enums.Routes.Routed_Outlet.content){
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

  checkOutlet(check:string){
    return Enums.Routes.Routed_Outlet[check]==this.currentOutlet;
  }

  getRoute():Promise<any>{
    return new Promise<any>((resolve,reject)=>{
      const sub = this._route.params.subscribe(params=>{
            this._id=params["id"];
            if(sub){
                sub.unsubscribe();
            }
            const id=params["id"];
            if(validObjectIDRegExp.test(id)){
                resolve(id);
            }else{
                reject({error:"Invalid ID"});
            }
        });
    });
  }

  ngOnInit(){
    if(this.shelter==undefined){
      this.getRoute()
      .then(shelId=>{
        const shelSub=this.shelterService.getShelter(shelId).subscribe(shelter=>{
          this.shelIdRequest = this.authService.shelIdRequest$.subscribe(()=>{
            this.authService.onShelId(shelter.idCai);
          });

          this.shelter=shelter;
          
          const permissionSub = this.authService.checkRevisionPermissionForShelter(shelter.idCai).subscribe(val=>{
            this.revisionPermission=val;
            if(permissionSub!=undefined){
              permissionSub.unsubscribe();
            }
            if(shelSub!=undefined){
              shelSub.unsubscribe();
            }
          }); 
        });
      })
      .catch(err=>{
        this.router.navigateByUrl('/list');
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