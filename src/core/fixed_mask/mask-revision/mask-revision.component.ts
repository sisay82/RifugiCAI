import {
  Component, Input, OnInit
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import {Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder,FormControl, Validators, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shelter/shelterPage/shared.service'
import { Subscription } from 'rxjs/Subscription';

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

  constructor(private router:Router,private _route:ActivatedRoute,private shelterService:ShelterService,private shared:BcSharedService,private fb: FormBuilder){
    this.maskForm = fb.group({
        name:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        alias:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        idCai:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        type:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        branch:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        owner:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        category:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)],
        ownerRegion:["",Validators.pattern(/^([A-Za-z0-9 ,.:;!?|)(_-]*)*$/)]
    }); 
  }

  save(){
    if(this.maskForm.valid){
      let shelter:IShelter;
      if(this.maskForm.dirty){
        shelter={
          _id:this.shelter._id,
          name:this.maskForm.controls.name.value,
          idCai:this.maskForm.controls.idCai.value,
          type:this.maskForm.controls.type.value,
          branch:this.maskForm.controls.branch.value,
          owner:this.maskForm.controls.owner.value,
          category:this.maskForm.controls.category.value,
          geoData:{
            location:{
              ownerRegion:this.maskForm.controls.ownerRegion.value
            }
          }
        }
        let shelUpdateSub=this.shelterService.updateShelter(shelter).subscribe(value=>{
          let maskConfirmSub=this.shared.maskConfirmSave$.subscribe((obj)=>{
            if(obj.dirty){
              let shelSub=this.shelterService.confirmShelter(this.shelter._id,true).subscribe(value=>{
                if(!value){
                  console.log("Error in Confirm"); 
                }else{
                  this.shared.onActiveOutletChange("content");
                  this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+obj.component+")");
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
            }else{
              this.shared.onActiveOutletChange("content");
              this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+obj.component+")");
              if(maskConfirmSub!=undefined){
                maskConfirmSub.unsubscribe();
              }
              if(shelUpdateSub!=undefined){
                shelUpdateSub.unsubscribe();
              }
            }
          });
          this.shared.onMaskSave(shelter);
        });
      }else{
        let maskConfirmSub=this.shared.maskConfirmSave$.subscribe((obj)=>{
          if(obj.dirty){
            let shelSub=this.shelterService.confirmShelter(this.shelter._id,true).subscribe(value=>{
              if(!value){
                console.log("Error in Confirm"); 
              }else{
                this.shared.onActiveOutletChange("content");
                this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+obj.component+")");
              }
              if(shelSub!=undefined){
                shelSub.unsubscribe();
              }
              if(maskConfirmSub!=undefined){
                maskConfirmSub.unsubscribe();
              }
            });
          }else{
            this.shared.onActiveOutletChange("content");
            this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+obj.component+")");
            if(maskConfirmSub!=undefined){
              maskConfirmSub.unsubscribe();
            }
          }
        });
        this.shared.onMaskSave(shelter);
      }
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
        //this.maskForm.controls.alias.setValue(this.data.alias);
        this.maskForm.controls.idCai.setValue(this.shelter.idCai);
        this.maskForm.controls.type.setValue(this.shelter.name);
        this.maskForm.controls.branch.setValue(this.shelter.branch);
        this.maskForm.controls.owner.setValue(this.shelter.owner);
        this.maskForm.controls.category.setValue(this.shelter.category);
        this.maskForm.controls.ownerRegion.setValue(this.shelter.geoData.location.ownerRegion);
      }
  }   

  ngOnInit(){
    if(this.shelter==undefined){
      let routeSub=this._route.params.subscribe(params=>{
        let shelSub=this.shelterService.getShelter(params['id']).subscribe(shelter=>{
            this.shelter=shelter;
            this.initForm();
            shelSub.unsubscribe();
            routeSub.unsubscribe();
        });
      });
    }
  }

  cancel(){
    let cancelSub=this.shared.maskCancelConfirm$.subscribe(()=>{
      let shelSub=this.shelterService.confirmShelter(this.shelter._id,false).subscribe(value=>{
        if(!value){
          console.log("Error in Cancel"); 
          shelSub.unsubscribe();
          cancelSub.unsubscribe();
        }else{
          let activeComponentSub=this.shared.activeComponentAnswer$.subscribe(component=>{
            this.shared.onActiveOutletChange("content");
            this.router.navigateByUrl("/shelter/"+this.shelter._id+"/(content:"+component+")");
            activeComponentSub.unsubscribe();
            shelSub.unsubscribe();
            cancelSub.unsubscribe();
          });
          this.shared.onActiveComponentRequest();
        }
        
      });
    });
    this.shared.onMaskCancel();

    
  }

}