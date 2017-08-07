import {
  Component,Input,forwardRef,ViewEncapsulation,Directive
} from '@angular/core';
import { IButton } from '../../../app/shared/types/interfaces'
import { ControlValueAccessor,NG_VALUE_ACCESSOR,FormControl,NG_VALIDATORS } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Enums } from '../../../app/shared/types/enums';

@Directive({
    selector: 'input[bc-enable-error]',
    host: {
        '[class.invalid]': 'invalid'
    }
})
export class BcFileInputErrorStyler {
    @Input('bc-enable-error') invalid: boolean;
}


@Component({
    moduleId: module.id,
    selector: 'bc-file-input',
    templateUrl: 'file_input.component.html',
    styleUrls: ['file_input.component.scss'],
    host:{
        'role':'fileinput',
        '[class.bc-file-input]':'true'
    },
    providers: [
        { 
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcFileInput),
        multi: true
        },{
            provide:NG_VALIDATORS,
            useExisting:forwardRef(()=>BcFileInput),
            multi:true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BcFileInput implements ControlValueAccessor {
    propagateChange = (_: any) => {};
    invalid:boolean=false;
    value:File;
    @Input() required:boolean=false;
    @Input() title = "";
    @Input() sizeLimit:number=1024*1024*16;
    _contentType:String="";
    @Input() set contentType(value:String[]){
        this._contentType=value.join(",");
    }

    getAcceptables(){
        return this._contentType;
    }
    
    writeValue(value: any): void {
        if(value!=undefined){
            this.value=value;
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {}

    setDisabledState?(isDisabled: boolean): void {}

    onChange(event){
        const files = event.target.files || event.srcElement.files;
        this.value = files[0];
        
        this.propagateChange(this.value);
    }

    validate(c:FormControl){
        if(c.value!=undefined){
            this.value = c.value;
            if(this.value.size>this.sizeLimit){
                this.invalid=true;
                return {err:"Size over limit"};
            }else{
                this.invalid=false;
                return null;
            }
        }
    }

    constructor(){}
}