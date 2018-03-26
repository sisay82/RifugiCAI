import {
    Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IShelter, IContribution, IFile,IContributionData,IFileRef } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {RevisionBase} from '../shared/revision_base';
import {BcAuthService} from '../../../app/shared/auth.service';

@Directive({
selector:"[data-bc-button],[bc-button]",
host:{
    "[class.disabled]":"disable"
    }
})
export class BcDisableDataStyler{
    @Input("disabled") disable:boolean=false;
}
    
@Component({
    moduleId: module.id,
    selector: 'bc-contributions-revision',
    templateUrl: 'contributions.component.html',
    styleUrls: ['contributions.component.scss'],
    providers:[ShelterService]
})
export class BcContributionRevision extends RevisionBase {
    docs:IFile[]=<any>[];
    newAttachmentForm: FormGroup;
    contrForm: FormGroup; 
    private accepted:boolean;
    filesEnum:String[]=[];
    maskSaveSub:Subscription;
    loading:boolean=false;
    name:String;
    contribution:IContribution;
    statusChange:boolean=false;
    constructor(shelterService:ShelterService,_route:ActivatedRoute,router:Router,authService:BcAuthService,private fb: FormBuilder,shared:BcSharedService,revisionService:BcRevisionsService){
        super(shelterService,shared,revisionService,_route,router,authService);
        this.MENU_SECTION=Enums.MenuSection.economy;
        this.contrForm=fb.group({
            handWorks:[""],
            customizedWorks:[""],
            safetyCharges:[""],
            totWorks:[""],
            surveyorsCharges:[""],
            connectionsCharges:[""],
            technicalCharges:[""],
            testCharges:[""],
            taxes:[""],
            totCharges:[""],
            IVAincluded:[""],
            totalProjectCost:[""],
            externalFinancing:[""],
            selfFinancing:[""],
            red:[""],
            attachments:fb.array([]),
            type:[],
            value:[""]
        });

        this.newAttachmentForm = fb.group({
            newValue:[""],
        });

        this.formValidSub = this.contrForm.statusChanges.subscribe((value)=>{
            if(value=="VALID"){
                if(!this.maskError){
                    this.displayError=false;
                }
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            if(!this.maskError&&this.contrForm.valid){
                if(this.statusChange||this.contrForm.dirty){
                    this.disableSave=true;
                    this.save(true);
                }else{
                    shared.onMaskConfirmSave(Enums.Routes.Routed_Component.contribution);
                }
            }else{
                this.abortSave();
            }
        });
    
        shared.activeComponent=Enums.Routes.Routed_Component.contribution;
        shared.onSetDisableMaskSave(true);
    }

    getFormControls(controlName){
        return (<FormGroup>this.contrForm.controls[controlName]).controls;
    }

    getEnumValues(){
        return Object.keys(Enums.Contributions).map(o=>Enums.Contribution_Type[o]);
    }

    initAttachment(value:String,id:String){
        return this.fb.group({
            value: [value],
            id:[id]
        });
    }

    addAttachment(value,id){
        const control = <FormArray>this.contrForm.controls['attachments'];
        control.push(this.initAttachment(value,id));
    }

    removeAttachment(index){
        this.statusChange=true;
        const control = <FormArray>this.contrForm.controls['attachments'];
        control.removeAt(index);
    }

    addNewAttachment(){
        this.statusChange=true;
        const control = <FormArray>this.contrForm.controls['attachments'];
        let name:String=this.newAttachmentForm.controls["newValue"].value;
        let id;
        if(name){
            if(name.indexOf(":")>-1){
                id=name.split(":")[1];
                name=name.split(":")[0];
            }else{
                id=this.docs.find(obj=>obj.name==name)._id;
            }
            if(control.controls.find(obj=>obj.value.id==id)==undefined){
                this.filesEnum.splice(this.filesEnum.indexOf(this.newAttachmentForm.controls["newValue"].value),1)
                control.push(this.initAttachment(name,id));
                this.resetAttachmentForm();
            }
        }
    }

    resetAttachmentForm(){
        this.newAttachmentForm=this.fb.group({
            newValue:[""]
        });
    }

    accept(confirm){
        if(this.contrForm.valid){
            this.loading=true;
            this.accepted=confirm;
            this.statusChange=true;
            this.shared.onSendMaskSave();
        }else{
            this.displayError=true;
        }
    }

    getNumber(val):number{
        let n:number=<number>(new Number(val));
        if(isNaN(n)){
            return 0;
        }else{
            return n;
        }
    }

    getTotalWorks():number{
        return (this.getNumber(this.contrForm.controls.handWorks.value)+
            this.getNumber(this.contrForm.controls.customizedWorks.value)+
            this.getNumber(this.contrForm.controls.safetyCharges.value));
    }

    getTotalCharges():number{
        return (this.getNumber(this.contrForm.controls.surveyorsCharges.value)+
        this.getNumber(this.contrForm.controls.connectionsCharges.value)+
        this.getNumber(this.contrForm.controls.technicalCharges.value)+
        this.getNumber(this.contrForm.controls.testCharges.value)+
        this.getNumber(this.contrForm.controls.taxes.value));
    }

    getTotalCost():number{
        return this.getTotalCharges()+this.getTotalWorks();
    }

    getRedValue():number{
        return this.getTotalCost()-(
            this.getNumber(this.contrForm.controls.externalFinancing.value)+
            this.getNumber(this.contrForm.controls.selfFinancing.value)
        )
    }
    
    roundValue(value:number):number{
        return (Math.floor(value/100)*100);
    }

    checkRole(){
        return this.userRole==Enums.Auth_Permissions.User_Type.sectional||this.userRole==Enums.Auth_Permissions.User_Type.superUser;
    }

    initForm(contributions:IContribution){
        if(this.checkRole()){
            if(this.checkPermission &&contributions&&!contributions.accepted){
                this.contrForm.controls.type.setValue(contributions.type);
                this.contrForm.controls.handWorks.setValue(contributions.data?(contributions.data.handWorks):null);
                this.contrForm.controls.customizedWorks.setValue(contributions.data?(contributions.data.customizedWorks):null);
                this.contrForm.controls.safetyCharges.setValue(contributions.data?(contributions.data.safetyCharges):null);
                this.contrForm.controls.totWorks.setValue(this.getTotalWorks());
                this.contrForm.controls.surveyorsCharges.setValue(contributions.data?(contributions.data.surveyorsCharges):null);
                this.contrForm.controls.connectionsCharges.setValue(contributions.data?(contributions.data.connectionsCharges):null);
                this.contrForm.controls.technicalCharges.setValue(contributions.data?(contributions.data.technicalCharges):null);
                this.contrForm.controls.testCharges.setValue(contributions.data?(contributions.data.testCharges):null);
                this.contrForm.controls.taxes.setValue(contributions.data?(contributions.data.taxes):null);
                this.contrForm.controls.totCharges.setValue(this.getTotalCharges());
                this.contrForm.controls.IVAincluded.setValue(contributions.data?(contributions.data.IVAincluded):null);
                this.contrForm.controls.totalProjectCost.setValue(this.getTotalCost());
                this.contrForm.controls.externalFinancing.setValue(contributions.data?(contributions.data.externalFinancing):null);
                this.contrForm.controls.selfFinancing.setValue(contributions.data?(contributions.data.selfFinancing):null);
                this.contrForm.controls.red.setValue(this.getRedValue());
                this.contrForm.controls.value.setValue(this.roundValue(this.getRedValue()));
                if(contributions.attachments){
                    for(let att of contributions.attachments){
                        (<FormArray>this.contrForm.controls.attachments).controls.push(this.initAttachment(att.name,att.id))
                    }
                }
            }
        }else{
            this.contrForm.disable();
        }
        
    }

    save(confirm){
        if(!confirm||this.contrForm.valid){
            let shelter:IShelter={_id:this._id};
            let contr:IContribution={
                year:(new Date()).getFullYear(),
                value:this.roundValue(this.getRedValue()),
                type:this.contrForm.value.type,
                attachments:[] as [IFileRef],
                accepted:this.accepted||false,
                data:{
                    handWorks:this.getControlValue(<FormGroup>this.contrForm.controls.handWorks),
                    customizedWorks:this.getControlValue(<FormGroup>this.contrForm.controls.customizedWorks),
                    safetyCharges:this.getControlValue(<FormGroup>this.contrForm.controls.safetyCharges),
                    totWorks:this.getTotalWorks(),
                    surveyorsCharges:this.getControlValue(<FormGroup>this.contrForm.controls.surveyorsCharges),
                    connectionsCharges:this.getControlValue(<FormGroup>this.contrForm.controls.connectionsCharges),
                    technicalCharges:this.getControlValue(<FormGroup>this.contrForm.controls.technicalCharges),
                    testCharges:this.getControlValue(<FormGroup>this.contrForm.controls.testCharges),
                    taxes:this.getControlValue(<FormGroup>this.contrForm.controls.taxes),
                    totCharges:this.getTotalCharges(),
                    IVAincluded:this.getControlValue(<FormGroup>this.contrForm.controls.IVAincluded),
                    totalProjectCost:this.getTotalCost(),
                    externalFinancing:this.getControlValue(<FormGroup>this.contrForm.controls.externalFinancing),
                    selfFinancing:this.getControlValue(<FormGroup>this.contrForm.controls.selfFinancing),
                    red:this.getRedValue()
                }
            };        

            (<FormArray>this.contrForm.controls.attachments).controls.forEach(item=>{
                contr.attachments.push({name:item.value.value,id:item.value.id});
            });

            shelter.contributions = contr;            
            this.processSavePromise(shelter,"contributions")
            .then(()=>{
                this.displayError=false;
                if(confirm){
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.contribution);
                }
            })
            .catch(err=>{
                console.log(err);
                this.abortSave();
            });

        }else{
            this.loading=false;
            this.abortSave();
        }
    }

    checkValidForm(){
        return this.contrForm.valid;
    }

    ngOnDestroy(){
        this.shared.onSetDisableMaskSave(false);
        if(this.statusChange||this.contrForm.dirty){
            if(!this.disableSave){
                this.save(false);
            }
        }
        if(this.maskInvalidSub){
            this.maskInvalidSub.unsubscribe();
        }
        if(this.maskSaveSub){
            this.maskSaveSub.unsubscribe();
        }
        if(this.formValidSub){
            this.formValidSub.unsubscribe();
        }
        if(this.maskValidSub){
            this.maskValidSub.unsubscribe();
        }
    }

    getDocs(shelId):Promise<IFile[]>{
        return new Promise<IFile[]>((resolve,reject)=>{
            let loadServiceSub=this.revisionService.loadFiles$.subscribe(files=>{
                if(!files){
                let queryFileSub=this.shelterService.getFilesByShelterId(shelId).subscribe(files=>{
                    this.revisionService.onChildSaveFiles(files);
                    if(queryFileSub!=undefined){
                        queryFileSub.unsubscribe();
                    }
                    resolve(files.filter(obj=>obj.type!=Enums.Files.File_Type.contribution));
                });
                }else{
                    resolve(files);
                }
                if(loadServiceSub!=undefined){
                    loadServiceSub.unsubscribe();
                }
            });
            this.revisionService.onChildLoadFilesRequest([Enums.Files.File_Type.invoice,Enums.Files.File_Type.doc,Enums.Files.File_Type.map]);
        });
    }

    getContribution(id):Promise<IShelter>{
        return new Promise<IShelter>((resolve,reject)=>{
            let revSub=this.revisionService.load$.subscribe(shelter=>{
                if(shelter!=null&&shelter.contributions!=undefined){
                    if(revSub!=undefined){
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                }else{
                    let shelSub=this.shelterService.getShelterSection(id,"contributions").subscribe(shelter=>{
                        this.revisionService.onChildSave(shelter,"contributions");
                        if(shelSub!=undefined){
                            shelSub.unsubscribe();
                        }
                        if(revSub!=undefined){
                            revSub.unsubscribe();
                        }
                        resolve(shelter);
                    });
                }
          });
          this.revisionService.onChildLoadRequest("contributions");
        });
    }

    init(shelId) {
        this.getContribution(shelId)
        .then((shelter)=>{
            this.contribution=shelter.contributions;
            this.initForm(shelter.contributions);
            this.getDocs(shelId)
            .then((docs)=>{
                this.docs=docs;
                docs.forEach(doc=>{
                    if(docs.filter(obj=>obj.name==doc.name).length>1){
                        if(doc.name.indexOf(":")==-1){
                            this.filesEnum.push(doc.name+":"+doc._id);                            
                        }
                    }else{
                        this.filesEnum.push(doc.name);
                    }
                });
            });
        });
    }
}