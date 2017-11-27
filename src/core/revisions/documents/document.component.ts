import {
  Component,Input,OnInit,OnDestroy,Directive
} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IShelter, IFile,IEconomy } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/Rx';
import {RevisionBase} from '../shared/revision_base';

@Directive({
selector:"div[disabled]",
host:{
    "[class.disabled]":"disabled"
  }
})
export class BcDisableDivStyler{
  @Input("disabled") disabled:boolean=false;
}

@Component({
  moduleId: module.id,
  selector: 'bc-doc-revision',
  templateUrl: 'document.component.html',
  styleUrls: ['document.component.scss'],
  providers:[ShelterService]
})
export class BcDocRevision extends RevisionBase{
  private newDocForm: FormGroup;
  private newMapForm: FormGroup;
  private newInvoiceForm: FormGroup;
  invoicesForm: FormGroup;
  private invalidYearsInvoice=".+";
  private initialData:IFile[]=[];
  private invoiceFormatBase=".+(\\,|\\/|\\-|\\\\|\\.|\\||_).+(\\,|\\/|\\-|\\\\|\\.|\\||_).+(\\,|\\/|\-|\\\\|\\.|\\||_)";
  invoiceFormatRegExp=/.+(\,|\/|\-|\\|\.|\||_).+(\,|\/|\-|\\|\.|\||_).+(\,|\/|\-|\\|\.|\||_).+/ //tipo, fornitore, numero, data
  docs:IFile[]=[];
  maps:IFile[]=[];
  private invoicesChange:boolean=false;
  invalid:boolean=false;
  private docFormValidSub:Subscription;
  private mapFormValidSub:Subscription;
  private invoicesFormValidSub:Subscription;
  private invoiceFormValidSub:Subscription;
  private invalidYears:Number[]=[];
  hiddenTag:boolean=true;
  uploading:boolean=false;
  disableSave:boolean=false;
  private currentFileToggle:number=-1;
  disableInvoiceGlobal:boolean=true;
  constructor(shelterService:ShelterService,shared:BcSharedService,router:Router,_route:ActivatedRoute,private fb: FormBuilder,revisionService:BcRevisionsService) { 
    super(shelterService,shared,revisionService,_route,router);
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
        if(!this.maskError&&this.newInvoiceForm.invalid&&this.newMapForm.invalid&&this.invoicesForm.invalid){
          this.setDisplayError(false);
        }
      }
    });

    this.invoiceFormValidSub = this.newInvoiceForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError&&this.newDocForm.invalid&&this.newMapForm.invalid&&this.invoicesForm.invalid){
          this.setDisplayError(false);
        }
      }
    });

    this.invoicesFormValidSub = this.invoicesForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError&&this.newInvoiceForm.invalid&&this.newMapForm.invalid&&this.newDocForm.invalid){
          this.setDisplayError(false);
        }
      }
    });

    this.mapFormValidSub = this.newMapForm.statusChanges.subscribe(value=>{
      if(value=="VALID"){
        if(!this.maskError&&this.newInvoiceForm.invalid&&this.newDocForm.invalid&&this.invoicesForm.invalid){
          this.setDisplayError(false);
        }
      }
    });

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
        if(!this.maskError){
          this.disableSave=true;
          if(this.newDocForm.dirty||this.newInvoiceForm.dirty||this.newMapForm.dirty||this.invoicesForm.dirty||this.invoicesChange){
            this.save(true);
          }else{
            this.shared.onMaskConfirmSave(Enums.Routed_Component.documents);
          }
        }else{
          shared.onDisplayError();
          this.setDisplayError(true);
        }
    });

    shared.activeComponent=Enums.Routed_Component.documents;
  }

  getInvoicesFormControls(controlName:string,index?){
    const control=(<FormArray>this.invoicesForm.controls[controlName]);
    if(index!=undefined){
      return control.at(index);
    }else{
      return control.controls;
    }
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

  checkDocName(name){
    return (name&&this.docs.concat(this.maps).find(obj=>obj&&obj.name==name)==undefined&&
    (<FormArray>this.invoicesForm.controls.files).controls.find(contr=>contr.value&&contr.value.name==name)==undefined)
  }

  toBuffer(ab) {
    let buf = new Buffer(ab.byteLength);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
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
    if(!(<FormArray>this.invoicesForm.controls.files).at(index).disabled){
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
  }

  addDoc(){
    let f=<File>(<FormGroup>(this.newDocForm.controls.file)).value;
    if(f&&this.newDocForm.valid&&this.checkDocName(f.name)){
      this.uploading=true;
      this.setDisplayError(false);
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
      this.setDisplayError(true);
    }
  }

  addMap(){
    let f=<File>(<FormGroup>(this.newMapForm.controls.file)).value;
    if(f&&this.newMapForm.valid&&this.checkDocName(f.name)){
      this.uploading=true;
      this.setDisplayError(false);
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
      this.setDisplayError(true);
    }
  }

  cleanForms(){
    this.newDocForm.reset();
    this.newMapForm.reset();
    this.newInvoiceForm.reset();
    this.currentFileToggle=-1;
  }

  initInvoice(file:IFile){
    return this.fb.group({
      _id:[file._id],
      contentType:[file.contentType],
      type:[file.type],
      description:[file.description],
      name:[file.name],
      size:[file.size],
      invoice_type:[file.invoice_type||""],
      invoice_tax:[file.invoice_tax||""],
      invoice_year:[file.invoice_year||""],
      contribution_type:[file.contribution_type||""],
      value:[file.value||""]
    });
  }

  updateInvalidYearsInvoice(confirmedEconomies?:IEconomy[]){
    this.invalidYears=[];
    this.disableInvoiceGlobal=true;
    if(confirmedEconomies&&confirmedEconomies.length>0){
      this.invalidYearsInvoice="(?!.*(";
      confirmedEconomies.forEach(economy => {
        this.invalidYears.push(economy.year);
        this.invalidYearsInvoice+=economy.year.toString()+"|"
      });
      this.invalidYearsInvoice=this.invalidYearsInvoice.slice(0,this.invalidYearsInvoice.length-1);    
      this.invalidYearsInvoice+=")).+";
    }else{
      this.invalidYearsInvoice=".+";
    }
    this.invoiceFormatRegExp=new RegExp(this.invoiceFormatBase+this.invalidYearsInvoice);
    this.disableInvoiceGlobal=false;
  }

  addInvoice(){
    let f=<File>(<FormGroup>(this.newInvoiceForm.controls.file)).value;
    if(f&&this.newInvoiceForm.valid&&this.checkDocName(f.name)){
      this.uploading=true;
      this.setDisplayError(false);
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
            this.invoicesChange=true;
            (<FormArray>this.invoicesForm.controls.files).push(this.initInvoice(f));
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
      this.setDisplayError(true);
    }
  }

  commitToFather(file:IFile,remove?:Boolean){
    let f:IFile = file;
    delete(f.data);
    this.revisionService.onChildSaveFile(f,remove)
  }

  getEnumValues():String[]{
    let currentYear=(new Date()).getFullYear();
    return [currentYear,currentYear-1].filter(val=>{
      return this.invalidYears.indexOf(val)==-1
    }).map(String);
  }

  save(confirm){
    if((!confirm||this.invoicesForm.valid)&&(!this.invoicesChange||this.invoicesForm.dirty)){
      this.setDisplayError(false);
      let i=0;
      if(this.invoicesForm.dirty){
        const filesToUpdate=(<FormArray>this.invoicesForm.controls.files).controls.filter(obj=>obj.dirty);
        for(let file of filesToUpdate){
          if(file.dirty&&this.invalidYears.indexOf(file.value.year)==-1){
            const updFile:IFile={
              _id:file.value._id,
              name:file.value.name,
              size:file.value.size,
              type:file.value.type,
              value:this.getControlValue(<FormGroup>(<FormGroup>file).controls.value),
              contentType:file.value.contentType,
              description:this.getControlValue(<FormGroup>(<FormGroup>file).controls.description),
              shelterId:this._id,
              invoice_tax:this.getControlValue(<FormGroup>(<FormGroup>file).controls.invoice_tax),
              invoice_type:file.value.invoice_type,
              invoice_year:file.value.invoice_year,
              contribution_type:file.value.contribution_type
            }
            if(<any>updFile.invoice_type!="Attività"){
              updFile.contribution_type=null;
            }
            let updateSub = this.shelterService.updateFile(updFile).subscribe((val)=>{
              if(val){
                i++;
                if(filesToUpdate.length==i&&confirm){
                  this.shared.onMaskConfirmSave(Enums.Routed_Component.documents);
                }
              }
              if(updateSub!=undefined){
                updateSub.unsubscribe();
              }
            });
            this.commitToFather(updFile);
          }
        }

      }else{
        this.setDisplayError(false);
        if(confirm){
          this.shared.onMaskConfirmSave(Enums.Routed_Component.documents);
        }
      }
    }else{
      this.abortSave();
    }
  }

  checkRequired(index){
    let val=(<FormArray>this.invoicesForm.controls.files).controls[index].value.invoice_type=="Attività"
    if(val){
      (<FormGroup>(<FormArray>this.invoicesForm.controls.files).controls[index]).controls.contribution_type.enable();
    }else{
      (<FormGroup>(<FormArray>this.invoicesForm.controls.files).controls[index]).controls.contribution_type.disable();
    }
    return val;
  }

  downloadFile(id){
    if(id&&this.initialData.findIndex(obj=>obj._id==id)>-1){
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
  }

  ngOnDestroy() {
    if(!this.disableSave){
      this.save(false);
    }
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

  initData(files:IFile[]){
    this.initialData=files;
    for(let file of files){
      if(file.type!=undefined){
        if(file.type==Enums.File_Type.doc){
          this.docs.push(file);       
        }else if(file.type==Enums.File_Type.map){
          this.maps.push(file);
        }else if(file.type==Enums.File_Type.invoice){
          const control=this.initInvoice(file);
          if(file.invoice_confirmed){
            control.disable();
          }
          (<FormArray>this.invoicesForm.controls.files).push(control);
        }
      }
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
      this.revisionService.onChildLoadFilesRequest([Enums.File_Type.doc,Enums.File_Type.map,Enums.File_Type.invoice]);
    });
  }

  getEconomy(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.revisionService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.economy!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"economy").subscribe(shelter=>{
                this.revisionService.onChildSave(shelter,"economy");
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
      this.revisionService.onChildLoadRequest("economy");
    });
  }

  init(shelId) {
    this.getDocs(shelId)
    .then(files=>{
      this.initData(files);
      this.getEconomy(shelId)
      .then(shelter=>{
        if(shelter.economy){
          this.updateInvalidYearsInvoice(shelter.economy.filter(obj=>obj.confirm));
        }
      })
    });
  }

}