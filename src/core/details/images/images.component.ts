import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder,FormControl, FormArray } from '@angular/forms';
import {ShelterService} from '../../../app/shelter/shelter.service'
import {BcSharedService} from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {DomSanitizer} from '@angular/platform-browser';
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
  selector: 'bc-img-detail',
  templateUrl: 'images.component.html',
  styleUrls: ['images.component.scss'],
  providers:[ShelterService]
})
export class BcImg {
    _id:String;
    data:{file:IFile,url:any}[]=[];
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute,private sanitizer:DomSanitizer) {
        shared.activeComponent="images";
        this.shared.onActiveOutletChange("content");
    }

    ngOnInit() {
        let routeSub=this._route.parent.params.subscribe(params=>{
            this._id=params["id"];
            let queryFileSub=this.shelterService.getImagesByShelterId(this._id).subscribe(files=>{
                for(let file of files){
                    let queryFileSub=this.shelterService.getFile(file._id).subscribe(file=>{
                        let data=Buffer.from(file.data);
                        let blob=new Blob([data],{type:<string>file.contentType});                        
                        var reader = new FileReader();
                        reader.onload = (e) => {
                            var src = reader.result;
                            this.data.push({file:file,url:src});
                        };
                        reader.readAsDataURL(blob);
                    });
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