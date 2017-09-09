import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/Rx';
import {BcAuthService} from '../../../app/shared/auth.service';

var maxImages:Number=10;

@Component({
  moduleId: module.id,
  selector: 'bc-img-revision',
  templateUrl: 'images.component.html',
  styleUrls: ['images.component.scss'],
  providers:[ShelterService]
})
export class BcImgRevision {
  newDocForm: FormGroup;
  docsForm: FormGroup;
  _id:String;
  name:String;
  displayTagError:boolean=false;
  invalid:boolean=false;
  disableSave=false;
  uploading:boolean=false;
  maskSaveSub:Subscription;
  displayError:boolean=false;
  maskError:boolean=false;
  maskInvalidSub:Subscription;
  maskValidSub:Subscription;
  newDocFormValidSub:Subscription;
  docsFormValidSub:Subscription;
  hiddenImage:boolean=true;
  permissionSub:Subscription;      
  sendButton:IButton={action:this.addDoc,ref:this,text:"Invia"}
  constructor(private shelterService:ShelterService,private authService:BcAuthService,private shared:BcSharedService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
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
    
    this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
      this.maskError=true;
    });

    this.maskValidSub = shared.maskValid$.subscribe(()=>{
      this.maskError=false;
      if(this.newDocForm.valid){
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
      this.checkPermission(permissions);
    });

    shared.onActiveOutletChange("revision");

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
      if(!this.maskError){
          if(this.newDocForm.dirty||this.docsForm.dirty){
              this.disableSave=true;
              this.save(true);
          }else{
              this.shared.onMaskConfirmSave("images");
          }
      }else{
          shared.onDisplayError();
          this.displayError=true;
      }
    });

    shared.activeComponent="images";
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
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
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
          description:this.newDocForm.controls.description.value||null,
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
                this.shared.onMaskConfirmSave("images");
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
    if(this.docsForm.valid){
      this.displayError=false;
      let i=0;
      for(let file of (<FormArray>this.docsForm.controls.files).controls){
        if(file.dirty){
          this.shelterService.updateFile(file.value.id,this._id,file.value.description).subscribe((val)=>{
            if(val){
              i++;
              if((<FormArray>this.docsForm.controls.files).controls.length==i&&confirm){
                this.shared.onMaskConfirmSave("images");
              }
            }
          });
          let f:IFile={name:file.value.name,size:file.value.size,_id:file.value.id,type:file.value.type,value:file.value.value,contentType:file.value.contentType,description:file.value.description};
          this.revisionService.onChildSaveFile(f);
        }else{
          i++;
          if((<FormArray>this.docsForm.controls.files).controls.length==i&&confirm){
            this.shared.onMaskConfirmSave("images");
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
      var e = document.createEvent('MouseEvents');
      let data=Buffer.from(file.data);
      let blob=new Blob([data],{type:<string>file.contentType});
      let a = document.createElement('a');
      a.download = <string>file.name;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = [file.contentType, a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
    });
  }

  ngOnDestroy() {
    if(this.docsForm.valid&&this.docsForm.dirty){
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

  initialize() {
    let routeSub=this._route.parent.params.subscribe(params=>{
      this._id=params["id"];
      let loadServiceSub=this.revisionService.loadFiles$.subscribe(files=>{
        if(!files){
          let queryFileSub=this.shelterService.getImagesByShelterId(this._id).subscribe(files=>{
            this.initForm(files);
            this.revisionService.onChildSaveFiles(files);
            if(queryFileSub!=undefined){
              queryFileSub.unsubscribe();
            }
            if(routeSub!=undefined){
              routeSub.unsubscribe();
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
          if(permissions.find(obj=>obj==Enums.MenuSection.document)>-1){
              this.revisionService.updateLocalPermissions(permissions);
              this.initialize();
          }else{
              location.href="/list";
          }
      }
  }

}