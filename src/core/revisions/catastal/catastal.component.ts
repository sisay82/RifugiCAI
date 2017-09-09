import {
  Component,Input,OnDestroy,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDrain,IEnergy,ICatastal, IButton, IShelter } from '../../../app/shared/types/interfaces'
import {Enums} from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {BcAuthService} from '../../../app/shared/auth.service';

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
export class BcCatastalRevision {
    _id:String;
    name:String;
    catastalForm: FormGroup; 
    energyForm: FormGroup; 
    drainForm: FormGroup; 
    invalid:boolean=false;
    catastal:ICatastal;
    energy:IEnergy;
    drain:IDrain;
    displayError:boolean=false;
    maskSaveSub:Subscription;
    disableSave=false;
    maskInvalidSub:Subscription;
    maskValidSub:Subscription;
    formCatValidSub:Subscription;
    formEnergyValidSub:Subscription;
    formDrainValidSub:Subscription;
    permissionSub:Subscription;    
    maskError:boolean=false;
    constructor(private shared:BcSharedService,private shelterService:ShelterService,private authService:BcAuthService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
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
            droughts:[""]
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

        this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
            this.maskError=true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(()=>{
            this.maskError=false;
            if(this.drainForm.valid&&this.catastalForm.valid&&this.energyForm.valid){
                this.displayError=false;
            }
        });

        let disableSaveSub = this.revisionService.childDisableSaveRequest$.subscribe(()=>{
            this.disableSave=true;
            this.revisionService.onChildDisableSaveAnswer();
            if(disableSaveSub!=undefined){
                disableSaveSub.unsubscribe();
            }
        });

        this.permissionSub = authService.revisionPermissions.subscribe(permissions=>{
            if(permissions.length>0){
                if(permissions.find(obj=>obj==Enums.MenuSection.detail)>-1){
                    this.initialize();
                }else{
                    location.href="/list";
                }
            }
        });

        this.shared.onActiveOutletChange("revision");

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.catastalForm.valid&&this.energyForm.valid&&this.drainForm.valid){
                if(this.catastalForm.dirty||this.energyForm.dirty||this.drainForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    this.shared.onMaskConfirmSave("catastal");
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });

        shared.activeComponent="catastal";
    }

    save(confirm){
        if(!this.catastalForm.dirty&&!this.drainForm.dirty&&!this.energyForm.dirty){
            this.shared.onMaskConfirmSave("catastal");
        }else{
            if(this.catastalForm.valid&&this.drainForm.valid&&this.energyForm.valid){
                let catastal:ICatastal;
                let energy:IEnergy;
                let drain:IDrain;
                let updates:number=0;
                if(this.catastalForm.dirty){
                    let shelter:any={_id:this._id,name:this.name};
                    updates++;
                    catastal={
                        buildingRegulation:this.catastalForm.controls["buildingRegulation"].value||null,
                        buildYear:this.catastalForm.controls["buildYear"].value||null,
                        rebuildYear:this.catastalForm.controls["rebuildYear"].value||null,
                        class:this.catastalForm.controls["class"].value||null,
                        code:this.catastalForm.controls["code"].value||null,
                        typologicalCoherence:this.catastalForm.controls["typologicalCoherence"].value||null,
                        matericalCoherence:this.catastalForm.controls["matericalCoherence"].value||null,
                        cityPlanRegulation:this.catastalForm.controls["cityPlanRegulation"].value||null,
                        mainBody:this.catastalForm.controls["mainBody"].value||null,
                        secondaryBody:this.catastalForm.controls["secondaryBody"].value||null,
                        fireRegulation:this.catastalForm.controls["fireRegulation"].value||null,
                        ISO14001:this.catastalForm.controls["ISO14001"].value||null
                    }
                    shelter.catastal=catastal;
                    this.revisionService.onChildSave(shelter,"catastal");
                    let catSub=this.shelterService.preventiveUpdateShelter(shelter,"catastal").subscribe((returnVal)=>{
                        if(returnVal){
                            this.displayError=false;
                            updates--;
                            if(confirm&&updates==0){
                                this.shared.onMaskConfirmSave("catastal");
                            }
                            
                        }else{
                            console.log(returnVal);
                            this.displayError=true;
                        }
                        if(catSub!=undefined){
                            catSub.unsubscribe();
                        }
                    });
                }
                if(this.drainForm.dirty){
                    let shelter:any={_id:this._id,name:this.name};
                    updates++;
                    drain={
                        type:this.drainForm.controls["type"].value||null,
                        regulation:this.drainForm.controls["regulation"].value||null,
                        oilSeparator:this.drainForm.controls["oilSeparator"].value||null,
                        recycling:this.drainForm.controls["recycling"].value||null,
                        water_type:this.drainForm.controls["water_type"].value||null,
                        water_availability:this.drainForm.controls["water_availability"].value||null,
                        droughts:this.drainForm.controls["droughts"].value||null
                    }
                    shelter.drain=drain;
                    this.revisionService.onChildSave(shelter,"drain");
                    let drainSub=this.shelterService.preventiveUpdateShelter(shelter,"drain").subscribe((returnVal)=>{
                        if(returnVal){
                            this.displayError=false;
                            updates--;
                            if(confirm&&updates==0){
                                this.shared.onMaskConfirmSave("catastal");
                            }
                        }else{
                            console.log(returnVal);
                            this.displayError=true;
                        }
                        if(drainSub!=undefined){
                            drainSub.unsubscribe();
                        }
                    });
                }
                if(this.energyForm.dirty){
                    let shelter:any={_id:this._id,name:this.name};
                    updates++;
                    energy={
                        class:this.energyForm.controls["class"].value||null,
                        energy:this.energyForm.controls["energy"].value||null,
                        greenCertification:this.energyForm.controls["greenCertification"].value||null,
                        powerGenerator:this.energyForm.controls["powerGenerator"].value||null,
                        photovoltaic:this.energyForm.controls["photovoltaic"].value||null,
                        sourceType:this.energyForm.controls["sourceType"].value||null,
                        sourceName:this.energyForm.controls["sourceName"].value||null,
                        heating_type:this.energyForm.controls["heating_type"].value||null
                    }
                    shelter.energy=energy;
                    this.revisionService.onChildSave(shelter,"energy");
                    let energySub=this.shelterService.preventiveUpdateShelter(shelter,"energy").subscribe((returnVal)=>{
                        if(returnVal){
                            this.displayError=false;
                            updates--;
                            if(confirm&&updates==0){
                                this.shared.onMaskConfirmSave("catastal");
                            }
                        }else{
                            console.log(returnVal);
                            this.displayError=true;
                        }
                        if(energySub!=undefined){
                            energySub.unsubscribe();
                        }
                    });
                }
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

    initialize(){
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.getCatastal(params["id"])
            .then(()=>{
                this.getEnergy(params["id"])
                .then(()=>{
                    this.getDrain(params["id"])
                    .then(()=>{
                        if(routeSub!=undefined)
                            routeSub.unsubscribe();
                    });
                });
            });
        });
    }

    ngOnInit() {
        let permissions = this.revisionService.getLocalPermissions();
        if(permissions!=undefined){
            this.checkPermission(permissions);
        }        
    }

    checkPermission(permissions){
        if(permissions.length>0){
            if(permissions.find(obj=>obj==Enums.MenuSection.detail)>-1){
                this.revisionService.updateLocalPermissions(permissions);
                this.initialize();
            }else{
                location.href="/list";
            }
        }
    }
}