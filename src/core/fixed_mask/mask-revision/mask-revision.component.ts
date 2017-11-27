import {
  Component, Input, OnInit, OnDestroy, Directive,SimpleChanges,OnChanges,ViewEncapsulation
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {createValidationFunction} from '../../inputs/text/text_input.component';
import {BcAuthService} from '../../../app/shared/auth.service';

@Directive({
  selector:"[disabled]",
  host:{
    "[class.disabled]":"disable"
  }
})
export class BcDisableStyler{
  @Input('disabled') disable:boolean=false;
}

@Component({
    moduleId: module.id,
    selector: 'bc-mask-revision',
    templateUrl: 'mask-revision.component.html',
    styleUrls: ['mask-revision.component.scss'],
    providers:[ShelterService],
    host:{
      '[class.bc-mask]':'true'
    },
    encapsulation:ViewEncapsulation.None
})
export class BcMaskRevision {
  @Input() shelter:IShelter;
  maskForm: FormGroup; 
  formValiditySub:Subscription;
  maskSaveTriggerSub:Subscription;
  displayErrorSub:Subscription;
  displayError:boolean=false;
  shelterInitialized:Boolean=false;
  revisionPermission:Enums.User_Type;
  disableSave:boolean=false;
  saveDisabled:boolean=false;
  newShelter:boolean=false;
  private isCentral:boolean;
  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService,private fb: FormBuilder,private authService:BcAuthService){
    this.maskForm = fb.group({
        name:[""],
        alias:[""],
        idCai:[""],
        type:[""],
        branch:[""],
        owner:[""],
        category:[""],
        regional_type:[""],
    }); 

    this.maskSaveTriggerSub = this.shared.sendMaskSave$.subscribe(()=>{
      this.save();
    });

    this.formValiditySub = this.maskForm.statusChanges.subscribe((value)=>{
      if(value=="VALID"){
        shared.onMaskValid();
      }else if(value=="INVALID"){
        shared.onMaskInvalid();
      }
    });

    this.displayErrorSub = this.shared.displayError$.subscribe(()=>{
      this.displayError=true;
    });

    this.saveDisabled=(this.shared.activeComponent==Enums.Routed_Component.contribution);
    this.shared.disableMaskSave$.subscribe((val)=>{
      this.saveDisabled=val
    })
  }

  setMaskSaveDisabled(val){
    this.saveDisabled=val;
  }

  toggleMenu(){
    this.shared.onToggleMenu();
  }

  checkWinPlatform(){
    return (navigator.userAgent.toLowerCase().indexOf("win")==-1);
  }

  remove(){
    if(this.isCentralUser()){
      let removeShelSub = this.shelterService.deleteShelter(this.shelter._id).subscribe((val)=>{
        if(val){
          this.return();
        }else{
          
          this.shared.onMaskInvalid();
        }
        if(removeShelSub!=undefined){
          removeShelSub.unsubscribe();
        }
      });
    }
  }

  private isCentralUser(){
    if(this.isCentral){
        return this.isCentral
    }else{
        this.authService.isCentralUser().subscribe(val=>{
            this.isCentral=val;
            return val;
        });
    }
  }

  processConfirm(shelter):Promise<String>{
    return new Promise<any>((resolve,reject)=>{
      const maskConfirmSub=this.shared.maskConfirmSave$.subscribe(component=>{
        if(maskConfirmSub!=undefined){
          maskConfirmSub.unsubscribe();
        }
        if(component){
          const shelSub=this.shelterService.confirmShelter(shelter._id,true).subscribe(value=>{
            if(shelSub!=undefined){
              shelSub.unsubscribe();
            }
            
            if(!value){
              reject({error:"Error in confirm"});
            }else{
              resolve(component);        
            }
          });
        }
      });
      this.shared.onMaskSave(shelter);
    });
  }

  save(){
    if(this.revisionPermission&&(this.revisionPermission!=Enums.User_Type.central||this.maskForm.valid)){
      let shelter:IShelter={_id:this.shelter._id};
      if(this.revisionPermission==Enums.User_Type.central&&this.maskForm.dirty){
        shelter={
          _id:this.shelter._id,
          name:this.maskForm.controls.name.value,
          alias:this.maskForm.controls.alias.value||null,
          idCai:this.maskForm.controls.idCai.value||null,
          type:this.maskForm.controls.type.value||null,
          branch:this.maskForm.controls.branch.value||null,
          owner:this.maskForm.controls.owner.value||null,
          category:this.maskForm.controls.category.value||null,
          regional_type:this.maskForm.controls.regional_type.value||null
        }
        const shelUpdateSub=this.shelterService.updateShelter(shelter).subscribe(value=>{
          this.processConfirm(shelter)
          .then((component)=>{
            if(shelUpdateSub){
              shelUpdateSub.unsubscribe();
            }
            this.shared.onActiveOutletChange(Enums.Routed_Outlet.content);
            this.router.navigateByUrl("/shelter/"+shelter._id+"/(content:"+component+")");
          })
          .catch((err)=>{
            console.log(err);
          });
        });
      }else{
        this.processConfirm(shelter)
        .then((component)=>{
          this.shared.onActiveOutletChange(Enums.Routed_Outlet.content);
          this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+component+")");
        })
        .catch((err)=>{
          console.log(err);
        });
      }
    }else{
      this.displayError=true;
      this.shared.onMaskSave(null);
    }
  }

  return(){
    let cancelSub=this.shared.maskCancelConfirm$.subscribe(()=>{
      let shelSub=this.shelterService.confirmShelter(this.shelter._id,false).subscribe(value=>{
        if(!value){
          console.log("Error in Cancel"); 
          if(shelSub!=undefined)
            shelSub.unsubscribe();
          if(cancelSub!=undefined)
            cancelSub.unsubscribe();
        }else{
          this.router.navigateByUrl("list");
          if(shelSub!=undefined)
            shelSub.unsubscribe();
          if(cancelSub!=undefined)
            cancelSub.unsubscribe();
        }
        
      });
    });
    this.shared.onMaskCancel();
    
  }

  initForm(permission){
    this.revisionPermission=permission;    
    if(this.shelter!=undefined){
      this.maskForm.controls.name.setValue(this.shelter.name||null);
      this.maskForm.controls.alias.setValue(this.shelter.alias||null);
      this.maskForm.controls.idCai.setValue(this.shelter.idCai||null);
      this.maskForm.controls.type.setValue(this.shelter.type||null);
      this.maskForm.controls.branch.setValue(this.shelter.branch||null);
      this.maskForm.controls.owner.setValue(this.shelter.owner||null);
      this.maskForm.controls.category.setValue(this.shelter.category||null);
      this.maskForm.controls.regional_type.setValue(this.shelter.regional_type||null);
    }

    if(permission!=Enums.User_Type.central&&permission!=Enums.User_Type.superUser){
      this.maskForm.disable();
    }
  }   

  ngOnDestroy(){
    if(this.formValiditySub!=undefined){
      this.formValiditySub.unsubscribe();
    }
    if(this.displayErrorSub!=undefined){
      this.displayErrorSub.unsubscribe();
    }
    if(this.maskSaveTriggerSub!=undefined){
      this.maskSaveTriggerSub.unsubscribe();
    }
  }

  reviseCheck(permission?){
    return this.authService.revisionCheck(permission||this.revisionPermission);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!this.newShelter&&!this.shelterInitialized&&this.shelter!=undefined){
      this.shelterInitialized=true;
      let authSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val=>{
        if(val&&this.reviseCheck(val)){
          this.initForm(val);
        }else{
          this.return();
        }
        if(authSub!=undefined){
          authSub.unsubscribe();
        }
      });
    }
  }

  ngOnInit(){
    if(!this.shelterInitialized&&this.shelter!=undefined){
      this.shelterInitialized=true;
      let routeSub=this._route.params.subscribe(params=>{
        if(params["name"]!=undefined){
          if(params["name"]=="newShelter"){
            this.newShelter=true;
          }else{
          this.router.navigateByUrl("list");
          }
        }else{
          this.newShelter=false;
        }
        let authSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val=>{
          this.revisionPermission=val;
          if(!this.newShelter){
            if(val&&this.reviseCheck(val)){
              this.initForm(val);
            }else{
              this.return();
            }
          }
          if(!val){
            this.return();
          }
          if(routeSub!=undefined){
            routeSub.unsubscribe();
          }
          if(authSub!=undefined){
            authSub.unsubscribe();
          }
        });
      });
    }
  }

  cancel(){
    let cancelSub=this.shared.maskCancelConfirm$.subscribe(()=>{
      let shelSub=this.shelterService.confirmShelter(this.shelter._id,false).subscribe(value=>{
        if(!value){
          console.log("Error in Cancel"); 
          if(shelSub!=undefined)
            shelSub.unsubscribe();
          if(cancelSub!=undefined)
            cancelSub.unsubscribe();
        }else{
          if(this.newShelter){
            this.router.navigateByUrl("list");
          }else{
            let component = this.shared.activeComponent;
            this.shared.onActiveOutletChange(Enums.Routed_Outlet.content);
            this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+component+")");
          }
          if(shelSub!=undefined)
            shelSub.unsubscribe();
          if(cancelSub!=undefined)
            cancelSub.unsubscribe();
        }
        
      });
    });
    this.shared.onMaskCancel();
  }


}