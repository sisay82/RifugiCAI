import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IShelter, IFile } from '../../../app/shared/types/interfaces';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/Rx';
import {BcAuthService} from '../../../app/shared/auth.service';
import {RevisionBase} from '../shared/revision_base';

const maxImages:Number=10;

@Component({
  moduleId: module.id,
  selector: 'bc-img-revision',
  templateUrl: 'images.component.html',
  styleUrls: ['images.component.scss'],
  providers:[ShelterService]
})
export class BcImgRevision extends RevisionBase {
  private newDocForm: FormGroup;
  docsForm: FormGroup;
  private uploading:boolean=false;
  private newDocFormValidSub:Subscription;
  private docsFormValidSub:Subscription;
  private hiddenImage:boolean=true;
  constructor(shelterService:ShelterService,authService:BcAuthService,shared:BcSharedService,router:Router,_route:ActivatedRoute,private fb: FormBuilder,revisionService:BcRevisionsService) { 
    super(shelterService,shared,revisionService,_route,router,authService);
    this.MENU_SECTION=Enums.MenuSection.document;
    this.newDocForm = fb.group({
      file:[],
      description:[""]
    });

    this.docsForm = fb.group({
      files:fb.array([])
    });

    this.newDocFormValidSub = this.newDocForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
          if(!this.maskError&&this.docsForm.valid){
            this.displayError=false;
          }
      }
    });

    this.docsFormValidSub = this.docsForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError&&this.newDocForm.valid){
          this.displayError=false;
        }
      }
    });

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
      if(!this.maskError){
          if(this.newDocForm.dirty||this.docsForm.dirty){
              this.disableSave=true;
              this.save(true);
          }else{
              this.shared.onMaskConfirmSave(Enums.Routed_Component.images);
          }
      }else{
          shared.onDisplayError();
          this.displayError=true;
      }
    });

    shared.activeComponent=Enums.Routed_Component.images;
  }

  getFormControls(controlName){
    return (<FormGroup>this.docsForm.controls[controlName]).controls;
  }

  checkValidForm(){
    return this.docsForm.valid;
  }

  initFile(file:IFile){
    return this.fb.group({
      type:[file.type],
      id:[file._id],
      contentType:[file.contentType],
      name:[file.name],
      size:[file.size],
      description:[file.description]
    });
  }

  isUploading(){
    return this.uploading;
  }

  toBuffer(ab) {
    let buf = new Buffer(ab.byteLength);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
  }

  toggle(){
    this.hiddenImage=!this.hiddenImage;
  }

  isHidden(){
    return this.hiddenImage;
  }

  removeFile(id){
    this.commitToFather({_id:id,type:Enums.File_Type.image},true);
    let removeFileSub=this.shelterService.removeFile(id,this._id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        (<FormArray>this.docsForm.controls.files).controls.splice((<FormArray>this.docsForm.controls.files).controls.findIndex(f=>f.value.id==id),1);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    });
  }

  getContentType(){
    return Object.keys(Enums.Image_Type);
  }

  addDoc(){
    if(this.newDocForm.valid&&(<FormArray>this.docsForm.controls.files).controls.length<maxImages){
      this.uploading=true;
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newDocForm.controls.file)).value;
      let file:IFile={
          name:f.name,
          size:f.size,
          uploadDate:new Date(Date.now()),
          contentType:f.type,
          shelterId:this._id,
          description:this.getControlValue(<FormGroup>(<FormGroup>this.newDocForm).controls.description),
          type:Enums.File_Type.image
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
          file.data=this.toBuffer(fileReader.result);
          let shelServiceSub = this.shelterService.insertFile(file).subscribe(id => {
            if(id){
              let f=file;
              f._id=id;
              (<FormArray>this.docsForm.controls.files).push(this.initFile(f));
              this.commitToFather(f);
            }
            this.uploading=false;
            this.cleanForm();
            if(confirm){
                this.shared.onMaskConfirmSave(Enums.Routed_Component.images);
            }
            if(shelServiceSub!=undefined){
                shelServiceSub.unsubscribe();
            }
          });
      }
      fileReader.readAsArrayBuffer(f);
    }else{
      this.displayError=true;
    }
  }

  cleanForm(){
    this.newDocForm.reset();
    this.toggle();
  }

  save(confirm){
    if(!confirm||this.docsForm.valid){
      this.displayError=false;
      let i=0;
      for(let file of (<FormArray>this.docsForm.controls.files).controls){
        if(file.dirty){
          const updFile:IFile={
            _id:file.value.id,
            shelterId:this._id,
            description:this.getControlValue(<FormGroup>(<FormGroup>file).controls.description)
          }
          const updateSub = this.shelterService.updateFile(updFile).subscribe((val)=>{
            if(val){
              i++;
              if((<FormArray>this.docsForm.controls.files).controls.length==i&&confirm){
                this.shared.onMaskConfirmSave(Enums.Routed_Component.images);
              }
            }
            if(updateSub!=undefined){
              updateSub.unsubscribe();
            }
          });
          const f:IFile={
            name:file.value.name,
            size:file.value.size,
            _id:updFile._id,
            type:file.value.type,
            value:file.value.value,
            contentType:file.value.contentType,
            description:updFile.description
          };

          this.revisionService.onChildSaveFile(f);
        }else{
          i++;
          if((<FormArray>this.docsForm.controls.files).controls.length==i&&confirm){
            this.shared.onMaskConfirmSave(Enums.Routed_Component.images);
          }
        }
      }
    }else{
      this.displayError=true;
    }
  }

  commitToFather(file:IFile,remove?:Boolean){
    this.revisionService.onChildSaveFile({name:file.name,size:file.size,_id:file._id,type:file.type,value:file.value,contentType:file.contentType,description:file.description},remove)
  }

  downloadFile(id){
    let queryFileSub=this.shelterService.getFile(id).subscribe(file=>{
      let e = document.createEvent('MouseEvents');
      let data=Buffer.from(file.data);
      let blob=new Blob([data],{type:<string>file.contentType});
      let a = document.createElement('a');
      a.download = <string>file.name;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = [file.contentType, a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
      if(queryFileSub!=undefined){
        queryFileSub.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    if(!this.disableSave&&this.docsForm.dirty){
      this.save(false);
    }
    if(this.permissionSub!=undefined){
      this.permissionSub.unsubscribe();
    }
    if(this.maskSaveSub!=undefined){
      this.maskSaveSub.unsubscribe();
    }
    if(this.newDocFormValidSub!=undefined){
      this.newDocFormValidSub.unsubscribe();
    }
    if(this.docsFormValidSub!=undefined){
      this.docsFormValidSub.unsubscribe();
    }
    if(this.maskInvalidSub!=undefined){
        this.maskInvalidSub.unsubscribe();
    }
    if(this.maskValidSub!=undefined){
        this.maskValidSub.unsubscribe();
    }
  }

  initForm(files:IFile[]){
    for(let file of files){
      (<FormArray>this.docsForm.controls.files).push(this.initFile(file));
    }
  }

  init(shelId) {
    let loadServiceSub=this.revisionService.loadFiles$.subscribe(files=>{
      if(!files){
        let queryFileSub=this.shelterService.getImagesByShelterId(shelId).subscribe(files=>{
          this.initForm(files);
          this.revisionService.onChildSaveFiles(files);
          if(queryFileSub!=undefined){
            queryFileSub.unsubscribe();
          }
        });
      }else{
        this.initForm(files);
      }
      if(loadServiceSub!=undefined){
        loadServiceSub.unsubscribe();
      }
    });
    this.revisionService.onChildLoadFilesRequest([Enums.File_Type.image]);
  }

}