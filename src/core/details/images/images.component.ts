import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform,Directive,ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {DomSanitizer} from '@angular/platform-browser';
import 'rxjs/Rx';

@Directive({
    selector:"[full-screen]",
    host:{
        "[class.bc-image-full]":"enabled"
    }
})
export class BcResizeImgStyler{
    @Input("full-screen") enabled=false;
}

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
  selector: 'bc-img-detail',
  templateUrl: 'images.component.html',
  styleUrls: ['images.component.scss'],
  providers:[ShelterService],
  encapsulation:ViewEncapsulation.None
})
export class BcImg {
    _id:String;
    fullScreenImgId="";
    downloading:boolean=false;
    data:{file:IFile,url:any}[]=[];
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private sanitizer:DomSanitizer) {
        shared.activeComponent="images";
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

    isFullScreen(id){
        return this.fullScreenImgId==id;
    }

    enlargeImage(id){
        if(this.fullScreenImgId==id){
            this.fullScreenImgId="";
        }else{
            this.fullScreenImgId=id;
        }
    }

    getContentType():any[]{
        return Object.keys(Enums.Image_Type);
    }

    ngOnInit() {
        this.downloading=true;
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let i=0;
            let queryFileSub=this.shelterService.getImagesByShelterId(this._id).subscribe(files=>{
                let j=files.length;
                if(j>0){
                    for(let file of files){
                        let queryFileSub=this.shelterService.getFile(file._id).subscribe(file=>{
                            let data=Buffer.from(file.data);
                            let blob=new Blob([data],{type:<string>file.contentType});                        
                            var reader = new FileReader();
                            reader.onload = (e) => {
                                var src = reader.result;
                                this.data.push({file:file,url:src});
                                i++;
                                if(i==j){
                                    this.downloading=false;
                                }
                            };
                            reader.readAsDataURL(blob);
                        });
                    }
                }else{
                    this.downloading=false;
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