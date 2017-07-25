import {
  Component,Input,forwardRef,Directive
} from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR,FormControl } from '@angular/forms';
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

export let validators= {
    stringValidator:<RegExp>/^([A-Za-z0-99À-ÿ� ,.:/';!?|)(_-]*)*$/,
    telephoneValidator:<RegExp>/^([0-9]*)*$/,
    mailValidator:<RegExp>/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    numberValidator:<RegExp>/^[0-9]+[.]{0,1}[0-9]*$/,
    urlValidator:<RegExp>/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
}

function testValid(value,regExp){
    return regExp.test(value);
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
    providers: [
        { 
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcTextInput),
        multi: true
        }
    ]
})
export class BcTextInput implements ControlValueAccessor{
    propagateChange = (_: any) => {};
    invalid:boolean=false;
    @Input() value = "";
    @Input() enableBlock:boolean=false;
    @Input() required:boolean=false;

    _displayError:boolean=false;
    @Input() set displayError(enable:boolean){
        this._displayError=enable;
        if(!testValid(this.value,this._validator)&&enable){
            if(this.value!=""){
                this.invalid=true;
            }
        }else{
            this.invalid=false;
        }
    }

    @Input() title = "";

    _validator:RegExp=<RegExp>validators.stringValidator;
    @Input() set validator(validator){
        this._validator=validators[validator];
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
        if(testValid(this.value,this._validator)||this.value==""){
            this.invalid=false;
        }else{
            if(this._displayError){
                this.invalid=true;
            }
        }

        this.propagateChange(this.value);
    }

    constructor(){}
}