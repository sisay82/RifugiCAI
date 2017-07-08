import {
  Component,Input,OnInit
} from '@angular/core';
import { IService,ITag } from '../../../app/shared/types/interfaces'

@Component({
  moduleId: module.id,
  selector: 'bc-serv-item',
  templateUrl: 'serv-item.component.html',
  styleUrls: ['serv-item.component.scss'],

})
export class BcServItem {
  @Input() item:IService;
  options:ITag[]=[];
  checks:ITag[]=[];

  ngOnInit(){
    if(this.item!=undefined&&this.item.tags){
      for(let it of this.item.tags){
        if(it.value=="true"||it.value=="false"){
          this.checks.push(it);
        }else{
          this.options.push(it);
        }
      }
    }
    
  }
}