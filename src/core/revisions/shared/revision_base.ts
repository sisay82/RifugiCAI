import { Component,Input,OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITag,ILocation,IGeographic, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { parseDate } from '../../inputs/text/text_input.component';

export abstract class RevisionBase {
    protected _id:String;
    protected name:String;
    protected displayTagError:boolean=false;
    protected invalid:boolean=false;
    protected disableSave=false;
    protected maskSaveSub:Subscription;
    displayError:boolean=false;
    protected maskError:boolean=false;
    protected maskInvalidSub:Subscription;
    protected maskValidSub:Subscription;
    protected formValidSub:Subscription;

    constructor(protected shelterService,protected shared,protected revisionService,private _route,private router){

        shared.onActiveOutletChange("revision");

        this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
            this.maskError=true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(()=>{
            this.maskError=false;
            if(this.checkValidForm()){
                this.displayError=false;
            }
        });

        let disableSaveSub = revisionService.childDisableSaveRequest$.subscribe(()=>{
            this.disableSave=true;
            revisionService.onChildDisableSaveAnswer();
            if(disableSaveSub!=undefined){
                disableSaveSub.unsubscribe();
            }
        });
    }

    getRoute():Promise<any>{
        return new Promise<any>((resolve,reject)=>{
            let sub = this._route.parent.params.subscribe(params=>{
                this._id=params["id"];
                if(sub){
                    sub.unsubscribe();
                }
                resolve(params["id"]);
            });
        });
    }

    ngOnInit(){
        let sub = this.getRoute()
        .then(id=>{
            this.init(id);
        });
    }

    protected abstract init(shelID:String);

    redirect(url:any){
        this.router.navigateByUrl(url);
    }

    protected getControlValue(control:FormGroup):any{
        if(control&&control.valid){
            return control.value||null;
        }else return null;
    }

    protected processSavePromise(shelter,section):Promise<any>{
        return new Promise<any>((resolve,reject)=>{
            this.revisionService.onChildSave(shelter,section);
            let sub=this.shelterService.preventiveUpdateShelter(shelter,section).subscribe((returnVal)=>{
                if(returnVal){
                    resolve();
                }else{
                    reject(returnVal);
                }
                if(sub!=undefined){
                    sub.unsubscribe();
                }
            });
        });
    }

    protected processUrl(form:FormGroup){
        const value=this.getControlValue(form);
        if(value!=null&&value!=""){
            let wSite="http";
            if(value.toLowerCase().indexOf("://")==-1){
                wSite+="://"+value;
            }else{
                wSite=value;
            }  
            return wSite;
        }else{
            return null;
        }
    }

    protected processDate(form:FormGroup){
        const value=this.getControlValue(form);
        return parseDate(value)||null;
    }

    protected getFormValues(form:FormGroup):any{
        let obj:any={};
        for(let control in form.controls){
            obj[control]=this.getControlValue(<FormGroup>form.controls[control]);
        }
        return obj;
    }

    protected getFormArrayValues(form_array:FormArray):any[]{
        let obj:any[]=[];
        for(let c of form_array.controls){
            let p:any={};
            const contr=<FormGroup>c;
            for(let prop in contr.controls){
                p[prop]=this.getControlValue(<FormGroup>contr.controls[prop]);
            }
            obj.push(p);
        }
        return obj;
    }

    protected abstract checkValidForm();

    protected abstract save(confirm);
}