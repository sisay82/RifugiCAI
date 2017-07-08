import {
  Component, Input, OnInit, OnDestroy
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shelter/shelterPage/shared.service'
import { Subscription } from 'rxjs/Subscription';

let stringValidator=/^([A-Za-z0-99À-ÿ� ,.:/';!?|)(_-]*)*$/;
let telephoneValidator=/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
let mailValidator=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let numberValidator=/^[0-9]+[.]{0,1}[0-9]*$/;
let urlValidator=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

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
  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService,private fb: FormBuilder){
    this.maskForm = fb.group({
        name:["",Validators.pattern(stringValidator)],
        alias:["",Validators.pattern(stringValidator)],
        idCai:["",Validators.pattern(stringValidator)],
        type:["",Validators.pattern(stringValidator)],
        branch:["",Validators.pattern(stringValidator)],
        owner:["",Validators.pattern(stringValidator)],
        category:["",Validators.pattern(stringValidator)],
        regional_type:["",Validators.pattern(stringValidator)],
    }); 

    this.formValiditySub = this.maskForm.statusChanges.subscribe((value)=>{
      console.log(value);
      if(value=="VALID"){
        shared.onMaskValid();
      }else if(value=="INVALID"){
        shared.onMaskInvalid();
      }
    });
  }

  save(){
    if(this.maskForm.valid){
      let shelter:IShelter;
      if(this.maskForm.dirty){
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
      this.shared.onMaskInvalid();
    }
  }

  getEnumCategoryNames(){
    let names:any[]=[];
    const objValues = Object.keys(Enums.Shelter_Category).map(k => Enums.Shelter_Category[k]);
    objValues.filter(v => typeof v === "string").forEach((val)=>{
        names.push(val);
    });
    return names;
  }

  getEnumTypeNames(){
    let names:any[]=[];
    const objValues = Object.keys(Enums.Shelter_Type).map(k => Enums.Shelter_Type[k]);
    objValues.filter(v => typeof v === "string").forEach((val)=>{
        names.push(val);
    });
    return names;
  }

  getEnumRegionalTypeNames(){
    let names:any[]=[];
    const objValues = Object.keys(Enums.Regional_Type).map(k => Enums.Regional_Type[k]);
    objValues.filter(v => typeof v === "string").forEach((val)=>{
        names.push(val);
    });
    return names;
  }

  checkRegionalTypeEnum(value){
    if(this.maskForm.controls['regional_type'].value!=undefined){
        if(this.maskForm.controls['regional_type'].value!=''&&this.maskForm.controls['regional_type'].value.toLowerCase().indexOf(value.toLowerCase())>-1){
            return true;
        }
    }
    return false;
  }

  checkCategoryEnum(value){
    if(this.maskForm.controls['category'].value!=undefined){
        if(this.maskForm.controls['category'].value!=''&&this.maskForm.controls['category'].value.toLowerCase().indexOf(value.toLowerCase())>-1){
            return true;
        }
    }
    return false;
  }

  checkTypeEnum(value){
    if(this.maskForm.controls['type'].value!=undefined){
        if(this.maskForm.controls['type'].value!=''&&this.maskForm.controls['type'].value.toLowerCase().indexOf(value.toLowerCase())>-1){
            return true;
        }
    }
    return false;
  }

  return(){
    this.router.navigateByUrl("list");
  }

  initForm(){
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
  }   

  ngOnDestroy(){
    if(this.formValiditySub!=undefined){
      this.formValiditySub.unsubscribe();
    }
  }

  ngOnInit(){
    if(this.shelter==undefined){
      let routeSub=this._route.params.subscribe(params=>{
        let shelSub=this.shelterService.getShelter(params['id']).subscribe(shelter=>{
            this.shelter=shelter;
            this.initForm();
            if(shelSub!=undefined){
              shelSub.unsubscribe();
            } 
            if(routeSub!=undefined){
              routeSub.unsubscribe();
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
          let activeComponentSub=this.shared.activeComponentAnswer$.subscribe(component=>{
            this.shared.onActiveOutletChange("content");
            this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+component+")");
            if(activeComponentSub!=undefined)
              activeComponentSub.unsubscribe();
            if(shelSub!=undefined)
              shelSub.unsubscribe();
            if(cancelSub!=undefined)
              cancelSub.unsubscribe();
            });
          this.shared.onActiveComponentRequest();
        }
        
      });
    });
    this.shared.onMaskCancel();

    
  }

}