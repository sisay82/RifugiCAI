import {
    Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IContribution, IFile,ITag,IFileRef } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {RevisionBase} from '../shared/revision_base';
@Component({
    moduleId: module.id,
    selector: 'bc-contributions-revision',
    templateUrl: 'contributions.component.html',
    styleUrls: ['contributions.component.scss'],
    providers:[ShelterService]
})
export class BcContributionRevision extends RevisionBase {
    docs:IFile[]=<any>[];
    private newTagForm: FormGroup;
    private newAttachmentForm: FormGroup;
    private contrForm: FormGroup; 
    filesEnum:String[]=[];
    maskSaveSub:Subscription;
    name:String;
    statusChange:boolean=false;
    constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private fb: FormBuilder,private shared:BcSharedService,private revisionService:BcRevisionsService){
        super(shelterService,shared,revisionService);
    
        this.contrForm=fb.group({
            tags:fb.array([]),
            attachments:fb.array([]),
            type:[]
        });

        this.newTagForm = fb.group({
            newKey:[""],
            newValue:[""]
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
                    this.shared.onMaskConfirmSave("contribution");
                }
            }else{
                shared.onDisplayError();
                this.displayError=true;
            }
        });
    
        shared.activeComponent="contribution";
        this.shared.onActiveOutletChange("revision");
    }

    initTag(key:String,value:Number){
        return this.fb.group({
            key:[key],
            value: [value]
        });
    }

    initAttachment(value:String,id:String){
        return this.fb.group({
            value: [value],
            id:[id]
        });
    }

    addTag(key:String,value:Number){
        const control = <FormArray>this.contrForm.controls['tags'];
        control.push(this.initTag(key,value));
    }

    removeTag(index){
        this.statusChange=true;
        const control = <FormArray>this.contrForm.controls['tags'];
        control.removeAt(index);
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

    addNewTag(){
        this.statusChange=true;
        if(this.newTagForm.controls['newKey'].valid&&this.newTagForm.controls['newValue'].valid&&
        this.newTagForm.controls['newKey'].value!=""&&this.newTagForm.controls['newValue'].value!=""){
            const control = <FormArray>this.contrForm.controls['tags'];
            for(let c of control.controls){
                if(c.value.key.toLowerCase().indexOf(this.newTagForm.controls["newKey"].value.toLowerCase())>-1){
                    this.invalid=true;
                    return;
                }
            }
            this.invalid=false;
            control.push(this.initTag(this.newTagForm.controls["newKey"].value,this.newTagForm.controls["newValue"].value));
            this.resetTagForm();
        }else{
            this.invalid=true;
        }
    }

    resetAttachmentForm(){
        this.newAttachmentForm=this.fb.group({
            newValue:[""]
        });
    }

    resetTagForm(){
        this.newTagForm=this.fb.group({
            newKey:[""],
            newValue:[""]
        });
    }

    getTotal(){
        let total:any=0;
        (<FormArray>this.contrForm.controls.tags).controls.forEach((tag)=>{
            total+=new Number(tag.value.value);
        });
        return total;
    }
    
    save(confirm){
        if(this.contrForm.valid){
            let shelter:IShelter={_id:this._id};
            let contr:IContribution={
                year:(new Date()).getFullYear(),
                value:this.getTotal(),
                type:this.contrForm.value.type,
                data:[] as [ITag],
                attachments:[] as [IFileRef]
            };            
            (<FormArray>this.contrForm.controls.tags).controls.forEach(tag=>{
                contr.data.push({key:tag.value.key,value:tag.value.value});
            });
            (<FormArray>this.contrForm.controls.attachments).controls.forEach(item=>{
                contr.attachments.push({name:item.value.value,id:item.value.id});
            });
            shelter.contributions = [contr];
            let shelSub=this.shelterService.preventiveUpdateShelter(shelter,"contributions").subscribe((returnVal)=>{
                if(returnVal){
                    this.displayError=false;
                    if(confirm){
                        this.shared.onMaskConfirmSave("contribution");
                    }
                }else{
                    console.log("Err "+returnVal);
                    this.displayError=true;
                }
                if(shelSub!=undefined){
                    shelSub.unsubscribe();
                }
            });
        }else{
            this.displayError=true;
        }
    }

    checkValidForm(){
        return this.contrForm.valid;
    }

    ngOnDestroy(){
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
                    resolve(files);
                });
                }else{
                    resolve(files);
                }
                if(loadServiceSub!=undefined){
                    loadServiceSub.unsubscribe();
                }
            });
            this.revisionService.onChildLoadFilesRequest([Enums.File_Type.invoice,Enums.File_Type.doc,Enums.File_Type.map]);
        });
    }

    ngOnInit() {
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            this.getDocs(this._id)
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
                })
                if(routeSub!=undefined){
                    routeSub.unsubscribe();
                }
            });
        });
    }
}