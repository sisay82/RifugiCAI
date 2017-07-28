import {
  Component,Input,forwardRef,Directive,ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'bc-checkbox-input',
    templateUrl: 'checkbox_input.component.html',
    styleUrls: ['checkbox_input.component.scss'],
    host:{
        'role':'checkboxinput',
        '[class.bc-checkbox-input]':'true'
    },
    providers: [
        { 
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcCheckboxInput),
        multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BcCheckboxInput implements ControlValueAccessor {
    propagateChange = (_: any) => {};
    invalid:boolean=false;
    @Input() value;
    @Input() enableBlock:boolean=false;
    @Input() required:boolean=false;
    @Input() title = "";

    writeValue(value: any): void {
        if(value!=undefined){
            this.value=value;
        }
    }

    isChecked(){
        if(this.value!==""&&this.value!==null){
            if(this.value=="true"||this.value===true){
                return true;
            }else{
                return false;
            }
        }
        return false;
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {}

    setDisabledState?(isDisabled: boolean): void {}

    onChange(event:any){
        this.value=event.target.checked;

        this.propagateChange(this.value);
    }

    constructor(){}
}