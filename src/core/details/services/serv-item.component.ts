import {
  Component,Input,OnInit
} from '@angular/core';
import { IService,ITag } from '../../../app/shared/types/interfaces'
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'titleCase'})
export class TitleCasePipe implements PipeTransform {
    public transform(input:string): string{
        if (!input) {
            return '';
        } else {
            return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1) )).replace(/_/g," ");
        }
    }
    
}
  
@Component({
  moduleId: module.id,
  selector: 'bc-serv-item',
  templateUrl: 'serv-item.component.html',
  styleUrls: ['serv-item.component.scss'],

})
export class BcServItem {
  @Input() item:IService;
  options:ITag[]=[];
}