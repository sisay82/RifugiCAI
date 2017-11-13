import { Component,Input,OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITag,ILocation,IGeographic, IButton, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';

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

    constructor(shelterService,shared,revisionService){

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

    protected abstract checkValidForm();

    protected abstract save(confirm);
}