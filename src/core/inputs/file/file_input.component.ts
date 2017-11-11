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
    isDisabled:boolean=false;
    @Input() validator:RegExp;
    @Input() title = "";
    @Input() sizeLimit:number=1024*1024*16;
    @Input() errorMessage:string;
    @Input() optionalMessage:string;
    @Input() enableBlock:boolean=false;
    messageBlock:string;
    _contentType:String;
    types:String[];
    @Input() set contentType(value:String[]){
        if(value.length>0){
            this.types=value;
            this._contentType=value.join(",");
        }else{
            this.types=null;
            this._contentType=null;
        }
    }

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
    
    getAcceptables(){
        return this._contentType;
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

    onChange(event){
        if(!this.isDisabled){
            const files = event.target.files || event.srcElement.files;
            this.value = files[0];
        }
        this.propagateChange(this.value);
    }

    getExtension(filename:String){
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }

    checkExtension(value:String){
        return this.types.includes(value.toLowerCase());
    }

    testName(value:string){
        if(value.indexOf(".")>-1){
            let parts=value.split(".");
            let name="";
            for(let i=0;i<(parts.length-1);i++){
                name+=parts[i]+".";
            }
            name=name.substr(0,name.length-1)
            return this.validator.test(name);
        }else{
            return false;
        }
    }

    validate(c:FormControl){
        if(c.value!=undefined){
            if(
                (this.validator==undefined || this.testName(c.value.name))&&
                (c.value.size>0)&&
                (this.checkExtension(this.getExtension(c.value.name)))){
                    
                this.value = c.value;
                if(this.value.size>this.sizeLimit){
                    if(this.displayError){
                        this.invalid=true;
                    }
                    this.messageBlock=this.optionalMessage;
                    return {err:"Size over limit"};
                }else{
                    this.invalid=false;
                    return null;
                }
            }else{
                if(this.displayError){
                    this.invalid=true;
                }
                this.messageBlock=this.errorMessage;
                return {err:"Invalid content"};
            }  
        }
    }

    constructor(){}
}