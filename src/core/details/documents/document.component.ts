import {
  Component,Input,OnInit,OnDestroy,Pipe,PipeTransform
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter, IFile, IButton } from '../../../app/shared/types/interfaces'
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
    data:IFile[]=[];
    constructor(private shelterService:ShelterService,private shared:BcSharedService,private _route:ActivatedRoute) {
        shared.activeComponent="documents";
        this.shared.onActiveOutletChange("content");
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