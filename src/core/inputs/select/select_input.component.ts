import {
  Component,Input,forwardRef,ViewEncapsulation,Directive
} from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR,FormControl,NG_VALIDATORS } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Enums } from '../../../app/shared/types/enums';

@Directive({
    selector: 'select[bc-enable-error]',
    host: {
        '[class.invalid]': 'invalid'
    }
})
export class BcSelectInputErrorStyler {
    @Input('bc-enable-error') invalid: boolean;
}

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
    isDisabled:boolean=false;
    disableSelect:any;
    @Input() value = "";
    @Input() required:boolean=false;
    @Input() title = "";
    @Input() defaultContent="";
    @Input() enumName:any;
    @Input() noName:boolean=false;
    @Input() enumValues:any[]=[];
    @Input() enableBlock:boolean=false;
    @Input() errorMessage:string;
    _displayError:boolean=false;
    @Input() set displayError(enable:boolean){
        this._displayError=enable;
        if(this.required&&this.value==""){
            if(enable){
                this.invalid=true;
            }
        }else{
            this.invalid=false;
        }
    }

    get displayError(){
        return this._displayError;
    }

    getEnumNames(){
        if(this.isDisabled&&this.disableSelect){
            return [this.disableSelect]
        }else{
            if(this.enumName!=undefined){
                let names:any[]=[];
                const objValues = Object.keys(Enums[this.enumName]).map(k => Enums[this.enumName][k]);
                objValues.filter(v => typeof v === "string").forEach((val)=>{
                    names.push(val);
                });
                return names;
            }else if(this.enumValues!=undefined){
                return this.enumValues;
            }
        }
    }

    checkEnumValue(value){  
        if(value){
            if(this.value!=undefined){            
                if(this.value!=''&&this.value.toString().toLowerCase().indexOf(value.toString().toLowerCase())>-1){
                    return true;
                }
            }
            return false;
        }else{
            return value==this.value;
        }
    }

    writeValue(value: any): void {        
        if(!this.isDisabled&&value!=undefined){
            this.value=value;            
        }        
    }

    registerOnChange(fn: any): void {
        if(!this.isDisabled){
            this.propagateChange = fn;            
        }
    }

    registerOnTouched(fn: any): void {}

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled=isDisabled;
        if(isDisabled){
            this.disableSelect=this.value;
        }else{
            this.disableSelect=undefined;
        }
    }

    onChange(event:any) {
        if(!this.isDisabled){
            this.value=event.target.value;
            if(this.value==""&&this.required){
                if(this.displayError){
                    this.invalid=true;
                }
            }else{
                this.invalid=false;
            }
        }
        this.propagateChange(this.value);
    }

    constructor(){}
}