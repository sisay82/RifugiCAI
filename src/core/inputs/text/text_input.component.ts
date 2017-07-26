import {
  Component,Input,forwardRef,Directive,ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR,FormControl,NG_VALIDATORS,Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

function validateDate (c:FormControl){
    if(c.value!=''&&c.value!=null){
        let date = Date.parse(c.value);
        if(!isNaN(date)){
            return null;
        }else{
            return {valid:false};
        }
    }
    return null;
}

function createValidationFunction(validator:string){
    if(validator.indexOf("validateDate")>-1){
        return validateDate;
    }else{
        let regExp:RegExp=<RegExp>validators[validator];
        return function validationFunction(value){
            return regExp.test(value) ?  null : {valid:false};
        }
    }
}

export let validators= {
    stringValidator:<RegExp>/^([A-Za-z0-99À-ÿ� ,.:/';!?|)(_-]*)*$/,
    telephoneValidator:<RegExp>/^([0-9]*)*$/,
    mailValidator:<RegExp>/(^$|^.*@.*\..*$)/,
    numberValidator:<RegExp>/^[0-9]+[.]{0,1}[0-9]*$/,
    urlValidator:<RegExp>/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
}

@Directive({
    selector: 'input[bc-enable-error]',
    host: {
        '[class.invalid]': 'invalid'
    }
})
export class BcTextInputErrorStyler {
    @Input('bc-enable-error') invalid: boolean;
}

@Component({
    moduleId: module.id,
    selector: 'bc-text-input',
    templateUrl: 'text_input.component.html',
    styleUrls: ['text_input.component.scss'],
    host:{
        'role':'textinput',
        '[class.bc-text-input]':'true'
    },
    providers: [
        { 
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcTextInput),
        multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BcTextInput implements ControlValueAccessor {
    propagateChange = (_: any) => {};
    invalid:boolean=false;
    @Input() value = "";
    @Input() enableBlock:boolean=false;
    @Input() required:boolean=false;

    _displayError:boolean=false;
    @Input() set displayError(enable:boolean){
        this._displayError=enable;
        if(this.required&&this.value==""){
            if(enable){
                this.invalid=true;
            }
        }else{
            if(this._validator(this.value)!=null&&this.value!=""){
                if(enable){
                    this.invalid=true;
                }
            }else{
                this.invalid=false;
            }
        }
    }

    get displayError(){
        return this._displayError;
    }

    @Input() title = "";

    _validator:Function=createValidationFunction("stringValidator");
    @Input() set validator(validator){
        this._validator=createValidationFunction(validator);
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
    
    onKey(event:any){
        this.value=event.target.value;
        if(this._validator(this.value)==null&&!(this.required&&this.value=="")){
            this.invalid=false;
        }else{
            if(this.displayError){
                this.invalid=true;
            }
        }

        this.propagateChange(this.value);
    }

    constructor(){}
}