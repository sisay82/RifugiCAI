import {
  Component, Input, OnInit, OnDestroy,SimpleChanges,OnChanges
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

@Component({
    moduleId: module.id,
    selector: 'bc-mask-revision',
    templateUrl: 'mask-revision.component.html',
    styleUrls: ['mask-revision.component.scss'],
    providers:[ShelterService]
})
export class BcMaskRevision {
  @Input() shelter:IShelter;
  maskForm: FormGroup; 
  formValiditySub:Subscription;
  displayErrorSub:Subscription;
  displayError:boolean=false;
  shelterInitialized:Boolean=false;
  revisionPermission:Enums.User_Type;
  newShelter:boolean=false;
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

  isCentralUser(){
    return (this.revisionPermission&&this.revisionPermission==Enums.User_Type.central);
  }

  save(){
    if(this.revisionPermission&&(this.revisionPermission!=Enums.User_Type.central||this.maskForm.valid)){
      let shelter:IShelter;
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
        let shelUpdateSub=this.shelterService.updateShelter(shelter).subscribe(value=>{
          let maskConfirmSub=this.shared.maskConfirmSave$.subscribe((component)=>{
              let shelSub=this.shelterService.confirmShelter(this.shelter._id,true).subscribe(value=>{
                if(!value){
                  console.log("Error in Confirm"); 
                }else{
                  this.shared.onActiveOutletChange("content");
                  this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+component+")");
                }
                if(shelSub!=undefined){
                  shelSub.unsubscribe();
                }
                if(maskConfirmSub!=undefined){
                  maskConfirmSub.unsubscribe();
                }
                if(shelUpdateSub!=undefined){
                  shelUpdateSub.unsubscribe();
                }
              });
          });
          this.shared.onMaskSave(shelter);
        });
      }else{
        let maskConfirmSub=this.shared.maskConfirmSave$.subscribe((component)=>{
          let shelSub=this.shelterService.confirmShelter(this.shelter._id,true).subscribe(value=>{
            if(!value){
              console.log("Error in Confirm"); 
            }else{
              this.shared.onActiveOutletChange("content");
              this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+component+")");
            }
            if(shelSub!=undefined){
              shelSub.unsubscribe();
            }
            if(maskConfirmSub!=undefined){
              maskConfirmSub.unsubscribe();
            }
          });
        });
        this.shared.onMaskSave(shelter);
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
      this.maskForm.controls.name.setValue(this.shelter.name);
      this.maskForm.controls.alias.setValue(this.shelter.alias);
      this.maskForm.controls.idCai.setValue(this.shelter.idCai);
      this.maskForm.controls.type.setValue(this.shelter.type);
      this.maskForm.controls.branch.setValue(this.shelter.branch);
      this.maskForm.controls.owner.setValue(this.shelter.owner);
      this.maskForm.controls.category.setValue(this.shelter.category);
      this.maskForm.controls.regional_type.setValue(this.shelter.regional_type);
    }

    if(permission!=Enums.User_Type.central){
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!this.newShelter&&!this.shelterInitialized&&this.shelter!=undefined){
      this.shelterInitialized=true;
      let authSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val=>{
        if(val){
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
    });
    if(!this.newShelter&&!this.shelterInitialized&&this.shelter!=undefined){
      this.shelterInitialized=true;
      let authSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val=>{
        if(val){
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
            this.shared.onActiveOutletChange("content");
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