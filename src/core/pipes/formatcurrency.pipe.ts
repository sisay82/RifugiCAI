import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatcurrency'})
export class FormatCurrencyPipe implements PipeTransform {
    public transform(input:number): string{
        if (input==undefined||typeof(input)!=="number") {
          return '0,00 €';
        } else {
          return input.toFixed(2).toString().replace(/(\.)/g,",") + " €";
        }
    }
}