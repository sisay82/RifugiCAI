import {
  Component, Input,OnDestroy,ViewEncapsulation
} from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { Enums } from '../../app/shared/types/enums';
import { validators } from '../inputs/text/text_input.component';
import { ShelterService } from 'app/shelter/shelter.service';

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
  currentOutlet:Enums.Routed_Outlet;
  _id:String;  
  activeOutletSub:Subscription;
  shelIdRequest:Subscription;
  constructor(private shared:BcSharedService,private _route:ActivatedRoute,private router:Router,private shelterService:ShelterService){
    this.currentOutlet=shared.activeOutlet;
    this.activeOutletSub=shared.activeOutletChange$.subscribe(outlet=>{
        this.currentOutlet=outlet;
    });
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
          this.shelter=shelter;
          if(shelSub!=undefined){
            shelSub.unsubscribe();
          }
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