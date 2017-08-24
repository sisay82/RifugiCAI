import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'prefixPipe'})
export class PrefixPipe implements PipeTransform {
    public transform(input:string): string{
        if (!input) {
            return null;
        } else {
            return "+39"+input;
        }
    }
}