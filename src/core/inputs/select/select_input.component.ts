import {
  Component,Input,forwardRef,ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR,FormControl,NG_VALIDATORS } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Enums } from '../../../app/shared/types/enums';

@Component({
    moduleId: module.id,
    selector: 'bc-select-input',
    templateUrl: 'select_input.component.html',
    styleUrls: ['select_input.component.scss'],
    host:{
        'role':'selectinput',
        '[class.bc-select-input]':'true'
    },
    providers: [
        { 
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcSelectInput),
        multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BcSelectInput implements ControlValueAccessor {
    propagateChange = (_: any) => {};
    invalid:boolean=false;
    @Input() value = "";
    @Input() required:boolean=false;
    @Input() title = "";
    @Input() defaultContent="";
    @Input() enumName:any;

    getEnumNames(){
        if(this.enumName!=undefined){
            let names:any[]=[];
            const objValues = Object.keys(Enums[this.enumName]).map(k => Enums[this.enumName][k]);
            objValues.filter(v => typeof v === "string").forEach((val)=>{
                names.push(val);
            });
            return names;
        }
    }

    checkEnumValue(value){
        if(this.value!=undefined){
            if(this.value!=''&&this.value.toLowerCase().indexOf(value.toLowerCase())>-1){
                return true;
            }
        }
        return false;
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

    onChange(event:any) {
        this.value=event.target.value;

        this.propagateChange(this.value);
    }

    constructor(){}
}