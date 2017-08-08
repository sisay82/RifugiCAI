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

@Pipe({name: 'formatsize'})
export class FormatSizePipe implements PipeTransform {
    public transform(input:number): string{
        if (!input) {
          return '';
        } else {
          let size="B";
          let num=input;
          if(num>1024){
            size="KB";
            num/=1024;
            if(num>1024){
              size="MB";
              num/=1024;
            }
          }
          return num.toFixed(2) + " " + size;
        }
    }
}

@Component({
  moduleId: module.id,
  selector: 'bc-doc-revision',
  templateUrl: 'document.component.html',
  styleUrls: ['document.component.scss'],
  providers:[ShelterService]
})
export class BcDocRevision {
  newDocForm: FormGroup;
  newMapForm: FormGroup;
  newInvoiceForm: FormGroup;
  _id:String;
  name:String;
  docs:IFile[]=[];
  maps:IFile[]=[];
  invoices:IFile[]=[];
  displayTagError:boolean=false;
  invalid:boolean=false;
  disableSave=false;
  maskSaveSub:Subscription;
  displayError:boolean=false;
  maskError:boolean=false;
  maskInvalidSub:Subscription;
  maskValidSub:Subscription;
  docFormValidSub:Subscription;
  mapFormValidSub:Subscription;
  invoiceFormValidSub:Subscription;
  hiddenTag:boolean=true;
  currentFileToggle:number=-1;
  sendDocButton:IButton={action:this.addDoc,ref:this,text:"Invia"}
  sendMapButton:IButton={action:this.addMap,ref:this,text:"Invia"}
  sendInvoiceButton:IButton={action:this.addInvoice,ref:this,text:"Invia"}
  constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
    this.newDocForm = fb.group({
      file:[]
    });

    this.newMapForm = fb.group({
      file:[]
    });

    this.newInvoiceForm = fb.group({
      file:[]
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

    this.mapFormValidSub = this.newMapForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
          if(!this.maskError){
              this.displayError=false;
          }
      }
    });
    
     this.maskInvalidSub = shared.maskInvalid$.subscribe(()=>{
        this.maskError=true;
    });

    this.maskValidSub = shared.maskValid$.subscribe(()=>{
        this.maskError=false;
        if(this.newDocForm.valid&&this.newInvoiceForm.valid&&this.newMapForm.valid){
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

    shared.onActiveOutletChange("revision");

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
        if(!this.maskError){
            if(this.newDocForm.dirty&&this.newInvoiceForm.dirty&&this.newMapForm.dirty){
                this.disableSave=true;
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
    let removeFileSub=this.shelterService.removeFile(id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        this.docs.splice(this.docs.findIndex(file=>file._id==id),1);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    })
  }

  removeMap(id){
    let removeFileSub=this.shelterService.removeFile(id).subscribe(value=>{
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

  removeInvoice(id){
    let removeFileSub=this.shelterService.removeFile(id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        this.invoices.splice(this.invoices.findIndex(file=>file._id==id),1);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    })
  }

  addDoc(){
    if(this.newDocForm.valid){
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newDocForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:this._id
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=this.toBuffer(fileReader.result);
        let shelServiceSub = this.shelterService.insertFile(file).subscribe(valid => {
          if(valid){
            this.docs.push(file)
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

  addMap(){
    if(this.newMapForm.valid){
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newMapForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:this._id
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=this.toBuffer(fileReader.result);
        let shelServiceSub = this.shelterService.insertFile(file).subscribe(valid => {
          if(valid){
            this.maps.push(file)
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

  addInvoice(){
    if(this.newInvoiceForm.valid){
      this.displayError=false;
      let f=<File>(<FormGroup>(this.newInvoiceForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:this._id
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=this.toBuffer(fileReader.result);
        let shelServiceSub = this.shelterService.insertFile(file).subscribe(valid => {
          if(valid){
            this.invoices.push(file)
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

  save(confirm){
    this.displayError=false;
    if(confirm){
        this.shared.onMaskConfirmSave("documents");
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
    if(!this.disableSave){
        this.save(false);
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
  }

  ngOnInit() {
    let routeSub=this._route.parent.params.subscribe(params=>{
      this._id=params["id"];
      let queryFileSub=this.shelterService.getFilesByShelterId(this._id).subscribe(files=>{
        for(let file of files){
          if(file.contentType!=undefined){
            if(Object.keys(Enums.Docs_Type).find(f=>f==file.contentType)){
              this.docs.push(file);       
            }else if(Object.keys(Enums.Maps_Type)){
              this.maps.push(file);
            }else if(Object.keys(Enums.Invoices_Type)){
              this.invoices.push(file);
            }
          }
        }
        if(queryFileSub!=undefined){
          queryFileSub.unsubscribe();
        }
        if(routeSub!=undefined){
          routeSub.unsubscribe();
        }
      });
    });
    
  }

}