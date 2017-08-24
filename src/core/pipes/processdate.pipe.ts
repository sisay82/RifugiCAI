import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'processDate'})
export class ProcessDatePipe implements PipeTransform {
    public transform(input:number): string{
        if (!input) {
          return '----';
        } else {
          let year:any=0;
          let month:any=Math.trunc(input%12);
          year=Math.trunc(input/12);
          if(year>0){
            return year+" anni, "+month+" mesi";
          }else{
            return month+" mesi";
          }
        }
    }
}