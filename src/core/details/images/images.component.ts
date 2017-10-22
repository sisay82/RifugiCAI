import {
  Component,Input,OnInit,OnDestroy,Directive,ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile } from '../../../app/shared/types/interfaces';
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {DomSanitizer} from '@angular/platform-browser';
import 'rxjs/Rx';
import {BcDetailsService} from '../details.service';

@Directive({
    selector:"[full-screen]",
    host:{
        "[class.bc-image-full]":"enabled"
    }
})
export class BcResizeImgStyler{
    @Input("full-screen") enabled=false;
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
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private sanitizer:DomSanitizer,private detailsService:BcDetailsService) {
        shared.activeComponent="images";
        this.shared.onActiveOutletChange("content");
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

    initImages(files){
        let i=0;
        let j=files.length;
        if(j>0){
            for(let file of files){
                let queryFileSub=this.shelterService.getFile(file._id).subscribe(file=>{
                    let data=Buffer.from(file.data);
                    let blob=new Blob([data],{type:<string>file.contentType});                        
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        let src = reader.result;
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
    }

    ngOnInit() {
        this.downloading=true;
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let loadServiceSub=this.detailsService.loadFiles$.subscribe(files=>{
              if(!files){
                let queryFileSub=this.shelterService.getImagesByShelterId(this._id).subscribe(files=>{
                  this.initImages(files);
                  this.detailsService.onChildSaveFiles(files);
                  if(queryFileSub!=undefined){
                    queryFileSub.unsubscribe();
                  }
                  if(routeSub!=undefined){
                    routeSub.unsubscribe();
                  }
                });
              }else{
                this.initImages(files);
              }
              if(loadServiceSub!=undefined){
                loadServiceSub.unsubscribe();
              }
            });
            this.detailsService.onChildLoadFilesRequest([Enums.File_Type.image]);
        });
    }
}