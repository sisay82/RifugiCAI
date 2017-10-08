import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/Rx';
import {RevisionBase} from '../shared/revision_base';

@Component({
  moduleId: module.id,
  selector: 'bc-doc-revision',
  templateUrl: 'document.component.html',
  styleUrls: ['document.component.scss'],
  providers:[ShelterService]
})
export class BcDocRevision extends RevisionBase{
  newDocForm: FormGroup;
  newMapForm: FormGroup;
  newInvoiceForm: FormGroup;
  invoicesForm: FormGroup;
  invoceFormatRegExp=<RegExp>/.+[,\/\-\\.\|_].+[,\/\-\\.\|_].+/  
  docs:IFile[]=[];
  maps:IFile[]=[];
  invoicesChange:boolean=false;
  invalid:boolean=false;
  docFormValidSub:Subscription;
  mapFormValidSub:Subscription;
  invoicesFormValidSub:Subscription;
  invoiceFormValidSub:Subscription;
  hiddenTag:boolean=true;
  uploading:boolean=false;
  currentFileToggle:number=-1;
  sendDocButton:IButton={action:this.addDoc,ref:this,text:"Invia"}
  sendMapButton:IButton={action:this.addMap,ref:this,text:"Invia"}
  sendInvoiceButton:IButton={action:this.addInvoice,ref:this,text:"Invia"}
  constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
    super(shelterService,shared,revisionService);
    this.newDocForm = fb.group({
      file:[]
    });

    this.newMapForm = fb.group({
      file:[]
    });

    this.newInvoiceForm = fb.group({
      file:[]
    });

    this.invoicesForm = fb.group({
      files:fb.array([])
    });

    this.docFormValidSub = this.newDocForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError){
            this.displayError=false;
        }
      }
    });

    this.invoiceFormValidSub = this.newInvoiceForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError){
            this.displayError=false;
        }
      }
    });

    this.invoicesFormValidSub = this.invoicesForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError){
            this.displayError=false;
        }
      }
    });

    this.mapFormValidSub = this.newMapForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError){
            this.displayError=false;
        }
      }
    });

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
        if(!this.maskError){
          if(this.newDocForm.dirty||this.newInvoiceForm.dirty||this.newMapForm.dirty||this.invoicesForm.dirty){
            this.save(true);
          }else{
            this.shared.onMaskConfirmSave("documents");
          }
        }else{
          shared.onDisplayError();
          this.displayError=true;
        }
    });

    shared.activeComponent="documents";
  }

  checkValidForm(){
    return this.newDocForm.valid&&this.newInvoiceForm.valid&&this.newMapForm.valid&&this.invoicesForm.valid;
  }

  getTotal(value,tax){
    if(tax>1){
      return (value*(tax/100))+value;
    }else{
      return (value*tax)+value;
    }
  }

  getKeys(enumName){
    return Object.keys(Enums[enumName]);
  }

  isHiddenFile(value){
    return this.currentFileToggle!=value;
  }

  toggleFile(value:number){
    if(this.currentFileToggle==value){
      this.currentFileToggle=-1;
    }else{
      this.currentFileToggle=value;
    }
  }

  toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
  }

  removeDoc(id){
    this.commitToFather({_id:id,type:Enums.File_Type.doc},true);
    let removeFileSub=this.shelterService.removeFile(id,this._id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        this.docs.splice(this.docs.findIndex(file=>file._id==id),1);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    });
  }

  isUploading(){
    return this.uploading;
  }

  removeMap(id){
    this.commitToFather({_id:id,type:Enums.File_Type.map},true);
    let removeFileSub=this.shelterService.removeFile(id,this._id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        this.maps.splice(this.maps.findIndex(file=>file._id==id),1);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    })
  }

  removeInvoice(index,id){
    this.commitToFather({_id:id,type:Enums.File_Type.invoice},true);
    let removeFileSub=this.shelterService.removeFile(id,this._id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        (<FormArray>this.invoicesForm.controls.files).removeAt(index);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    });
  }

  addDoc(){
    if(this.newDocForm.valid){
      this.uploading=true;
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newDocForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:this._id,
        type:Enums.File_Type.doc
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=this.toBuffer(fileReader.result);
        let shelServiceSub = this.shelterService.insertFile(file).subscribe(id => {
          if(id){
            let f=file;
            f._id=id;
            this.docs.push(f);
            this.commitToFather(f);
          }
          this.uploading=false;
          if(shelServiceSub!=undefined){
            shelServiceSub.unsubscribe();
          }
          this.cleanForms();
        });
      }
      fileReader.readAsArrayBuffer(f);
    }else{
      this.displayError=true;
    }
  }

  addMap(){
    if(this.newMapForm.valid){
      this.uploading=true;
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newMapForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:this._id,
        type:Enums.File_Type.map
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=this.toBuffer(fileReader.result);
        let shelServiceSub = this.shelterService.insertFile(file).subscribe(id => {
          if(id){
            let f=file;
            f._id=id;
            this.maps.push(f);
            this.commitToFather(f);
          }
          this.uploading=false;
          if(shelServiceSub!=undefined){
            shelServiceSub.unsubscribe();
          }
          this.cleanForms();
        });
      }
      fileReader.readAsArrayBuffer(f);
    }else{
      this.displayError=true;
    }
  }

  cleanForms(){
    this.newDocForm.reset();
    this.newMapForm.reset();
    this.newInvoiceForm.reset();
    this.currentFileToggle=-1;
  }

  testInvoiceName(value){
    return true// invoceFormatRegExp.test(value);
  }

  initInvoice(file:IFile){
    return this.fb.group({
      _id:[file._id],
      name:[file.name],
      size:[file.size],
      invoice_type:[file.invoice_type||""],
      invoice_tax:[file.invoice_tax||""],
      invoice_year:[file.invoice_year||""],
      contribution_type:[file.contribution_type||""],
      value:[file.value||""]
    });
  }

  addInvoice(){
    if(this.newInvoiceForm.valid&&this.testInvoiceName(<File>(<FormGroup>(this.newInvoiceForm.controls.file)).value)){
      this.uploading=true;
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newInvoiceForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:this._id,
        type:Enums.File_Type.invoice
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=this.toBuffer(fileReader.result);
        let shelServiceSub = this.shelterService.insertFile(file).subscribe(id => {
          if(id){
            let f=file;
            f._id=id;
            (<FormArray>this.invoicesForm.controls.files).push(this.initInvoice(f))
            this.commitToFather(f);
          }
          this.uploading=false;
          if(shelServiceSub!=undefined){
            shelServiceSub.unsubscribe();
          }
          this.cleanForms();
        });
      }
      fileReader.readAsArrayBuffer(f);
    }else{
      this.displayError=true;
    }
  }

  commitToFather(file:IFile,remove?:Boolean){
    this.revisionService.onChildSaveFile({name:file.name,size:file.size,_id:file._id,type:file.type,value:file.value,contentType:file.contentType,description:file.description},remove)
  }

  save(confirm){
    if(this.invoicesForm.valid){
      this.displayError=false;
      let i=0;
      if(this.invoicesForm.dirty){
        for(let file of (<FormArray>this.invoicesForm.controls.files).controls){
          if(file.dirty){
            let updFile:IFile={
              _id:file.value._id,
              name:file.value.name,
              size:file.value.size,
              type:file.value.type,
              value:file.value.value,
              contentType:file.value.contentType,
              description:file.value.description,
              shelterId:this._id,
              invoice_tax:file.value.invoice_tax,
              invoice_type:file.value.invoice_type,
              invoice_year:file.value.invoice_year,
              contribution_type:file.value.contribution_type
            }
            this.shelterService.updateFile(updFile).subscribe((val)=>{
              if(val){
                i++;
                if((<FormArray>this.invoicesForm.controls.files).controls.length==i&&confirm){
                  this.shared.onMaskConfirmSave("documents");
                }
              }
            });
            this.revisionService.onChildSaveFile(updFile);
          }
        }

      }else{
        this.displayError=false;
        if(confirm){
            this.shared.onMaskConfirmSave("documents");
        }
      }
    }else{
      this.displayError=true;
    }
    
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
    if(this.maskSaveSub!=undefined){
      this.maskSaveSub.unsubscribe();
    }
    if(this.docFormValidSub!=undefined){
      this.docFormValidSub.unsubscribe();
    }
    if(this.mapFormValidSub!=undefined){
      this.mapFormValidSub.unsubscribe();
    }
    if(this.invoiceFormValidSub!=undefined){
      this.invoiceFormValidSub.unsubscribe();
    }
    if(this.maskInvalidSub!=undefined){
        this.maskInvalidSub.unsubscribe();
    }
    if(this.maskValidSub!=undefined){
        this.maskValidSub.unsubscribe();
    }
  }

  initData(files){
    for(let file of files){
      if(file.type!=undefined){
        if(file.type==Enums.File_Type.doc){
          this.docs.push(file);       
        }else if(file.type==Enums.File_Type.map){
          this.maps.push(file);
        }else if(file.type==Enums.File_Type.invoice){
          (<FormArray>this.invoicesForm.controls.files).push(this.initInvoice(file));
        }
      }
    }
  }

  ngOnInit() {
    let routeSub=this._route.parent.params.subscribe(params=>{
      this._id=params["id"];
      let loadServiceSub=this.revisionService.loadFiles$.subscribe(files=>{
        if(!files){
          let queryFileSub=this.shelterService.getFilesByShelterId(this._id).subscribe(files=>{
            this.initData(files);
            this.revisionService.onChildSaveFiles(files);
            if(queryFileSub!=undefined){
              queryFileSub.unsubscribe();
            }
            if(routeSub!=undefined){
              routeSub.unsubscribe();
            }
          });
        }else{
          this.initData(files);
        }
        if(loadServiceSub!=undefined){
          loadServiceSub.unsubscribe();
        }
      });
      this.revisionService.onChildLoadFilesRequest([Enums.File_Type.doc,Enums.File_Type.map,Enums.File_Type.invoice]);
    });
  }

}