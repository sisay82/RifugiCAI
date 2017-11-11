import {
  Component,Input,forwardRef,Directive,ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR,FormControl,NG_VALIDATORS,Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

function validateDate(value){
    if(value!=''&&value!=null){
        let date = parseDate(value);
        
        if(date!=null&&!isNaN(date.valueOf())){
            return null;
        }else{
            return {valid:false};
        }
    }
    return null;
}

export function parseDate(input:String,removeYear?:boolean):Date{// dd-mm-yy | yy/mm/dd
    if(input!=null&&input!=""){
        if(input.indexOf("-")>-1){
            if(input.indexOf("/")>-1){
                return null;
            }else{
                let parts = input.split('-');// yy-mm-dd
                if(parts.length==3){
                    let year:string="";
                    if(parts[2].length==1){
                        year="200"+parts[2];
                    }else if(parts[2].length==2){
                        year="20"+parts[2];
                    }else{
                        year=parts[2];
                    }
                    return (new Date(Number.parseInt(year), Number.parseInt(parts[1])-1, Number.parseInt(parts[0])));
                }else{
                    if(parts.length==2){
                        return (new Date((new Date(Date.now())).getFullYear(), Number.parseInt(parts[1])-1, Number.parseInt(parts[0])));
                    }else{
                        return null;
                    }
                }
            }
        }else if(input.indexOf("/")>-1){
            if(input.indexOf("-")>-1){
                return null;
            }else{
                let parts = input.split('/');// yy/mm/dd
                if(parts.length==3){
                    let year:string="";
                    if(parts[2].length==1){
                        year="200"+parts[2];
                    }else if(parts[2].length==2){
                        year="20"+parts[2];
                    }else{
                        year=parts[2];
                    }
                    return (new Date(Number.parseInt(year), Number.parseInt(parts[1])-1, Number.parseInt(parts[0])));
                }else{
                    if(parts.length==2){
                        return (new Date((new Date(Date.now())).getFullYear(), Number.parseInt(parts[1])-1, Number.parseInt(parts[0])));
                    }else{
                        return null;
                    }
                }
            }
        }
    }else{
        return null;
    }
    
}

export function createValidationFunction(validator:string){
    if(validator.indexOf("validateDate")>-1){
        return validateDate;
    }else{
        let regExp:RegExp=<RegExp>validators[validator];
        return function validationFunction(value){
            return regExp.test(value) ? null :{valid:false};
        }
    }
}

let validators= {
    stringValidator:<RegExp>/^([A-Za-z0-99À-ÿ� ,.:/';+!?|)(_-]*)*$/,
    telephoneValidator:<RegExp>/^([+]([0-9][0-9][\s])?)?([0-9]*(\s)?[0-9]*)$/,
    mailValidator:<RegExp>/(^$|^.*@.*\..*$)/,
    numberValidator:<RegExp>/^(-)?[0-9]*([.][0-9]*)?$/,
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
        },{
            provide:NG_VALIDATORS,
            useExisting:forwardRef(()=>BcTextInput),
            multi:true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BcTextInput implements ControlValueAccessor {
    propagateChange = (_: any) => {};
    invalid:boolean=false;
    @Input() removeYear:boolean=false;
    @Input() replaceDot:boolean=false;
    @Input() value=null;
    @Input() enableBlock:boolean=false;
    @Input() required:boolean=false;
    @Input() title = "";
    @Input() errorMessage:string;
    private _placeholder;
    @Input() set placeholder(value){
        if(value){
            this._placeholder=value;
        }else{
            this._placeholder="";
        }
    }

    get placeholder(){
        if(this._placeholder){
            return this._placeholder;
        }else{
            return "";
        }
    }

    isDisabled:boolean=false;
    @Input() minLength:number;
    @Input() maxLength:number;
    @Input() minValue:number;
    @Input() maxValue:number;
    @Input() except:number;
    _displayError:boolean=false;
    @Input() set displayError(enable:boolean){
        this._displayError=enable;
        if(this.validate(<any>{value:this.value})!=null){
            this.invalid=true;
        }else{
            this.invalid=false;
        }
    }

    get displayError(){
        return this._displayError;
    }

    _validator:Function=createValidationFunction("stringValidator");
    @Input() set validator(validator){
        this._validator=createValidationFunction(validator);
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
    }
    
    onKey(event:any){
        if(!this.isDisabled){
            this.value=event.target.value;
        }
        this.propagateChange(this.value);        
    }

    processYear(value){
        if(value){
            let date=parseDate(value);
            if(date!=undefined){
                if(date.toString()!="Invalid Date"){
                    return parseDate(value,true).toLocaleDateString("it-IT",{month:'numeric',day:'numeric'})
                }else{
                    return value;
                }
            }else{
                return value;
            }
        }else{
            return value;
        }
    }

    getValue(){      
        if(this.value===true||this.value=="true") {
            return 'si';
        }
        else if(this.value=="false"||(this.value===false&&this.value!=="")) {
            return 'no'; 
        }
        else{
            if(this.removeYear){
                return this.processYear(this.value);
            }else if(this.replaceDot){
                return (<string>this.value).replace(/\,/g,'.')
            }else{
                return this.value;
            }
        } 
    }

    validate(c:FormControl){
        if(c.value!==null){
            this.value=c.value;
            if(
                (!this.required||(c.value!==undefined&&c.value!=""))&&
                (this._validator(c.value)===null)&&
                (!this.minLength||(c.value&&c.value.length>=this.minLength))&&
                (!this.maxLength||(c.value&&c.value.length<=this.maxLength))&&
                (!this.minValue||(c.value&&c.value>=this.minValue))&&
                (!this.maxValue||(c.value&&c.value<=this.maxValue))&&
                (!this.except||(c.value&&c.value!=this.except))
            ){
                this.invalid=false;
                return null;
            }else{
                if(this.displayError){
                    this.invalid=true;
                }
                return {valid:false};
            }
        }
    }

    constructor(){}
}