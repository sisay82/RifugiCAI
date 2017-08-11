import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
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
  selector: 'bc-doc-detail',
  templateUrl: 'document.component.html',
  styleUrls: ['document.component.scss'],
  providers:[ShelterService]
})
export class BcDoc {
    _id:String;
    docs:IFile[]=[];
    maps:IFile[]=[];
    invoices:IFile[]=[];
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute) {
        shared.activeComponent="documents";
        this.shared.onActiveOutletChange("content");
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

    getExtension(filename:String){
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }

    checkExtension(value:String,types:String[]){
        return types.includes(value)
    }

    getIcon(type,name){
        if(type==Enums.File_Type.doc){
            if(this.checkExtension(this.getExtension(name),["doc","docx"])){
                return "file-word-o"
            }else if(this.checkExtension(this.getExtension(name),["xls","xlsx"])){
                return "file-excel-o"
            }else if(this.checkExtension(this.getExtension(name),["txt"])){
                return "file-text-o"
            }else if(this.checkExtension(this.getExtension(name),["pdf"])){
                return "file-pdf-o"
            }else return "file-text-o";
        }else if(type==Enums.File_Type.map){
            if(this.checkExtension(this.getExtension(name),["dwg"])){
                return "map-o"
            }else if(this.checkExtension(this.getExtension(name),["pdf"])){
                return "file-pdf-o"
            }else{
                return "file-text-o";
            }
        }else if(type==Enums.File_Type.invoice){
            if(this.checkExtension(this.getExtension(name),["doc","docx"])){
                return "file-word-o"
            }else if(this.checkExtension(this.getExtension(name),["xls","xlsx"])){
                return "file-excel-o"
            }else if(this.checkExtension(this.getExtension(name),["txt"])){
                return "file-text-o"
            }else if(this.checkExtension(this.getExtension(name),["pdf"])){
                return "file-pdf-o"
            }else return "file-text-o";
        }else{
            return "file-text-o"
        }
        
    }

    ngOnInit() {
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let queryFileSub=this.shelterService.getFilesByShelterId(this._id).subscribe(files=>{
                for(let file of files){
                    if(file.type!=undefined){
                        if(file.type==Enums.File_Type.doc){
                            this.docs.push(file);       
                        }else if(file.type==Enums.File_Type.map){
                            this.maps.push(file);
                        }else if(file.type==Enums.File_Type.invoice){
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