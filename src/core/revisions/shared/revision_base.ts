import { FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { parseDate,validators } from '../../inputs/text/text_input.component';
import { Enums } from '../../../app/shared/types/enums';

const validObjectIDRegExp = validators.objectID;

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

        shared.onActiveOutletChange(Enums.Routed_Outlet.revision);

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
        let sub = this.getRoute()
        .then(id=>{
            this.init(id);
        })
        .catch(err=>{
            this.redirect('/pageNotFound');
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

    protected abortSave(){
        this.setDisplayError(true);
        this.shared.onMaskConfirmSave(null);
    }

    protected setDisplayError(value){
        this.displayError=value;
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

    protected processFormDate(form:FormGroup){
        if(form&&form.valid){
            return parseDate(form.value)||null;
        }else return null;
    }

    protected processSimpleDate(value){
        return parseDate(value);
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