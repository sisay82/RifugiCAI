import {
  Component,Input,OnDestroy,OnInit
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IDrain,IEnergy,ICatastal, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {BcAuthService} from '../../../app/shared/auth.service';
import {RevisionBase} from '../shared/revision_base';

function validateDate(c:FormControl){
    if(c.value!=''&&c.value!=null){
        let date = Date.parse(c.value);
        if(!isNaN(date)){
            return null;
        }else{
            return {valid:false};
        }
    }
    return null;
}

@Component({
  moduleId: module.id,
  selector: 'bc-catastal-revision',
  templateUrl: 'catastal.component.html',
  styleUrls: ['catastal.component.scss'],
  providers:[ShelterService]
})
export class BcCatastalRevision extends RevisionBase{
    catastalForm: FormGroup; 
    energyForm: FormGroup; 
    drainForm: FormGroup; 
    private catastal:ICatastal;
    private energy:IEnergy;
    private drain:IDrain;
    private formCatValidSub:Subscription;
    private formEnergyValidSub:Subscription;
    private formDrainValidSub:Subscription;
    constructor(shared:BcSharedService,shelterService:ShelterService,authService:BcAuthService,router:Router,_route:ActivatedRoute,private fb: FormBuilder,revisionService:BcRevisionsService) { 
        super(shelterService,shared,revisionService,_route,router,authService);
        this.catastalForm = fb.group({
            buildingRegulation:[""],
            buildYear:[""],
            rebuildYear:[""],
            class:[""],
            code:[""],
            typologicalCoherence:[""],
            matericalCoherence:[""],
            cityPlanRegulation:[""],
            mainBody:[""],
            secondaryBody:[""],
            fireRegulation:[""],
            ISO14001:[""]
        }); 

        this.energyForm = fb.group({
            class:[""],
            energy:[""],
            greenCertification:[""],
            powerGenerator:[""],
            photovoltaic:[""],
            heating_type:[""],
            sourceType:[""],
            sourceName:[""]
        });

        this.drainForm = fb.group({
            type:[""],
            regulation:[""],
            oilSeparator:[""],
            recycling:[""],
            water_type:[""],
            water_availability:[""],
            droughts:[""],
            water_certification:[""]
        });

        this.formCatValidSub = this.catastalForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(this.drainForm.valid&&this.energyForm.valid&&!this.maskError){
                    this.displayError=false;
                }
            }
        });

        this.formDrainValidSub = this.drainForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(this.catastalForm.valid&&this.energyForm.valid&&!this.maskError)
                    this.displayError=false;
            }
        });

        this.formEnergyValidSub = this.energyForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(this.drainForm.valid&&this.catastalForm.valid&&!this.maskError)
                    this.displayError=false;
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.catastalForm.valid&&this.energyForm.valid&&this.drainForm.valid){
                if(this.catastalForm.dirty||this.energyForm.dirty||this.drainForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave(Enums.Routed_Component.catastal);
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });

        shared.activeComponent=Enums.Routed_Component.catastal;
    }

    checkValidForm(){
        return this.drainForm.valid&&this.catastalForm.valid&&this.energyForm.valid;
    }

    processSaveForm(form:FormGroup,section:string):Promise<any>{
        if(form.dirty){
            let shelter:any={_id:this._id,name:this.name};
            let obj:any=this.getFormValues(form);

            shelter[section]=obj;
            return this.processSavePromise(shelter,section);
        }
    }

    getBooleanNumeric(obj:boolean):number{
        return obj?1:0;
    }

    getTotalDirtyForms():number{
        return 0+this.getBooleanNumeric(this.catastalForm.dirty)+
            this.getBooleanNumeric(this.drainForm.dirty)+
            this.getBooleanNumeric(this.energyForm.dirty)
    }

    save(confirm){
        if(!this.catastalForm.dirty&&!this.drainForm.dirty&&!this.energyForm.dirty){
            this.shared.onMaskConfirmSave(Enums.Routed_Component.catastal);
        }else{
            if(!confirm||(this.catastalForm.valid&&this.drainForm.valid&&this.energyForm.valid)){
                let catastal:ICatastal={};
                let energy:IEnergy={};
                let drain:IDrain={};
                let updates:number=this.getTotalDirtyForms();

                this.processSaveForm(this.catastalForm,"catastal")
                .then(()=>{
                    updates--;
                    if(confirm&&updates==0){
                        this.shared.onMaskConfirmSave(Enums.Routed_Component.catastal);
                    }
                })
                .catch(err=>{
                    console.log(err);
                    this.displayError=true;
                });

                this.processSaveForm(this.drainForm,"drain")
                .then(()=>{
                    updates--;
                    if(confirm&&updates==0){
                        this.shared.onMaskConfirmSave(Enums.Routed_Component.catastal);
                    }
                })
                .catch(err=>{
                    console.log(err);
                    this.displayError=true;
                });

                this.processSaveForm(this.energyForm,"energy")
                .then(()=>{
                    updates--;
                    if(confirm&&updates==0){
                        this.shared.onMaskConfirmSave(Enums.Routed_Component.catastal);
                    }
                })
                .catch(err=>{
                    console.log(err);
                    this.displayError=true;
                });
            }else{
                this.displayError=true;
            }
        }
    }

    initCatastalForm(shelter){
        this.catastal=shelter.catastal;
        if(this.catastal!=undefined){
            for(let prop in this.catastal){
                if(this.catastal.hasOwnProperty(prop)){
                    if(this.catastalForm.contains(prop)){
                        this.catastalForm.controls[prop].setValue(this.catastal[prop]);
                    }
                }
            }
        }
    }   

    initEnergyForm(shelter){
        this.energy=shelter.energy;
        if(this.energy!=undefined){
            for(let prop in this.energy){
                if(this.energy.hasOwnProperty(prop)){
                    if(this.energyForm.contains(prop)){
                        this.energyForm.controls[prop].setValue(this.energy[prop]);
                    }
                }
            }
        }
    }   

    initDrainForm(shelter){
        this.drain=shelter.drain;
        if(this.drain!=undefined){
            for(let prop in this.drain){
                if(this.drain.hasOwnProperty(prop)){
                    if(this.drainForm.contains(prop)){
                        this.drainForm.controls[prop].setValue(this.drain[prop]);
                    }
                }
            }
        }
    }   

    ngOnDestroy(){
        if(this.catastalForm.dirty||this.energyForm.dirty||this.drainForm.dirty){
            if(!this.disableSave)
                this.save(false);
        }
        if(this.permissionSub!=undefined){
            this.permissionSub.unsubscribe();
        }
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
        if(this.maskInvalidSub!=undefined){
            this.maskInvalidSub.unsubscribe();
        }
        if(this.maskValidSub!=undefined){
            this.maskValidSub.unsubscribe();
        }
        
    }

    getDrain(id):Promise<void>{
        return new Promise<void>((resolve,reject)=>{
            let revDrainSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.drain!=undefined){
                    this.name=shelter.name;
                    this.initDrainForm(shelter);
                    if(revDrainSub!=undefined){
                        revDrainSub.unsubscribe();
                    }
                    resolve();
                }else{
                    let catSub=this.shelterService.getShelterSection(id,"drain").subscribe(shel=>{
                        this.name=shel.name;
                        if(shel.drain==undefined) shel.drain={};
                        this.initDrainForm(shel);
                        this.revisionService.onChildSave(shel,"drain");
                        if(catSub!=undefined){
                            catSub.unsubscribe();
                        }
                        if(revDrainSub!=undefined){
                            revDrainSub.unsubscribe();
                        }
                        resolve();
                    });
                }
            });
            this.revisionService.onChildLoadRequest("drain");
        });
    }

    getEnergy(id):Promise<void>{
        return new Promise<void>((resolve,reject)=>{
            let revEnergySub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.energy!=undefined){
                    this.name=shelter.name;
                    this.initEnergyForm(shelter);
                    if(revEnergySub!=undefined){
                        revEnergySub.unsubscribe();
                    }
                    resolve();
                }else{
                    let catSub=this.shelterService.getShelterSection(id,"energy").subscribe(shel=>{
                        this.name=shel.name;
                        if(shel.energy==undefined) shel.energy={};
                        this.initEnergyForm(shel);
                        this.revisionService.onChildSave(shel,"energy");
                        if(catSub!=undefined){
                            catSub.unsubscribe();
                        }
                        if(revEnergySub!=undefined){
                            revEnergySub.unsubscribe();
                        }
                        resolve();
                    });
                }
            });
            this.revisionService.onChildLoadRequest("energy");
        });
    }

    getCatastal(id):Promise<void>{
        return new Promise<void>((resolve,reject)=>{
            let revCatSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.catastal!=undefined){
                    this.name=shelter.name;
                    this.initCatastalForm(shelter);
                    if(revCatSub!=undefined){
                        revCatSub.unsubscribe();
                    }
                    resolve();
                }else{
                    let catSub=this.shelterService.getShelterSection(id,"catastal").subscribe(shel=>{
                        this.name=shel.name;
                        if(shel.catastal==undefined) shel.catastal={};
                        this.initCatastalForm(shel);
                        this.revisionService.onChildSave(shel,"catastal");
                        if(catSub!=undefined){
                            catSub.unsubscribe();
                        }
                        if(revCatSub!=undefined){
                            revCatSub.unsubscribe();
                        }
                        resolve();
                    });
                }
            });
            this.revisionService.onChildLoadRequest("catastal");
        });
    }

    init(shelId){
        this.getCatastal(shelId)
        .then(()=>{
            this.getEnergy(shelId)
            .then(()=>{
                this.getDrain(shelId)
                .then(()=>{});
            });
        });
    }

}