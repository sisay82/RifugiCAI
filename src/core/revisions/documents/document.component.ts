import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
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
  _id:String;
  name:String;
  data:IFile[]=[];
  displayTagError:boolean=false;
  invalid:boolean=false;
  disableSave=false;
  maskSaveSub:Subscription;
  displayError:boolean=false;
  maskError:boolean=false;
  maskInvalidSub:Subscription;
  maskValidSub:Subscription;
  formValidSub:Subscription;
  hiddenTag:boolean=true;
  sendButton:IButton={action:this.addDoc,ref:this,text:"Invia"}
  constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private fb: FormBuilder,private revisionService:BcRevisionsService) { 
    this.newDocForm = fb.group({
      file:[]
    });

    this.formValidSub = this.newDocForm.statusChanges.subscribe(value=>{
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

    shared.onActiveOutletChange("revision");

    this.maskSaveSub=shared.maskSave$.subscribe(()=>{
        if(!this.maskError){
            if(this.newDocForm.dirty){
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

  toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
  }

  removeFile(id){
    let removeFileSub=this.shelterService.removeFile(id).subscribe(value=>{
      if(!value){
        console.log(value);
      }else{
        this.data.splice(this.data.findIndex(file=>file._id==id),1);
      }
      if(removeFileSub!=undefined){
        removeFileSub.unsubscribe();
      }
    })
  }

  addDoc(ref){
    if(ref.newDocForm.valid){
      ref.displayError=false;
      let f=<File>(<FormGroup>(ref.newDocForm.controls.file)).value;
      let file:IFile={
        name:f.name,
        size:f.size,
        uploadDate:new Date(Date.now()),
        contentType:f.type,
        shelterId:ref._id
      }
      let fileReader = new FileReader();
      fileReader.onloadend=(e:any)=>{
        file.data=ref.toBuffer(fileReader.result);
        let shelServiceSub = ref.shelterService.insertFile(file).subscribe(file => {
          if(file){
            ref.data.push(file)
          }
          if(confirm){
              ref.shared.onMaskConfirmSave("geographic");
          }
          if(shelServiceSub!=undefined){
            shelServiceSub.unsubscribe();
          }
        });
      }
      fileReader.readAsArrayBuffer(f);
    }else{
      ref.displayError=true;
    }
  }

  save(confirm){
    this.displayError=false;
    if(confirm){
        this.shared.onMaskConfirmSave("contacts");
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
  }

  ngOnInit() {
    let routeSub=this._route.parent.params.subscribe(params=>{
      this._id=params["id"];
      let queryFileSub=this.shelterService.getFilesByShelterId(this._id).subscribe(files=>{
        this.data=files;
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