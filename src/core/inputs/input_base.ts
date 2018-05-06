import {
    Input, Inject, Optional, Host, SkipSelf, OnInit
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    ValidatorFn,
    AsyncValidatorFn,
    NG_ASYNC_VALIDATORS,
    NG_VALIDATORS,
    AbstractControl,
    ControlContainer
} from '@angular/forms';
import { Observable } from 'rxjs';

function dateValidator(value) {
    return customDateValidator(<any>{ value: value });
}

export function customDateValidator(c: FormControl) {
    if (c.value) {
        const date = parseDate(c.value);
        if (date != null && !isNaN(date.valueOf())) {
            return null;
        } else {
            return {
                valid: false
            };
        }
    }
    return null;
}

function customDateParser(val, month?, day?) {
    if (val) {
        let retVal: Date;
        if (typeof val === "number") {
            retVal = new Date(val, month, day);
        } else {
            const date = new Date(val);
            retVal = new Date(date.getFullYear(), date.getMonth(), date.getDay());
        }
        if (retVal.toString() === "Invalid Date") {
            return null;
        } else {
            return retVal;
        }
    } else {
        return null
    }
}

function parseByCharacter(input: String, char: string) {
    if (char.length === 1) {
        const parts = input.split(char); // yy-mm-dd
        if (parts.length === 3) {
            let year = "";
            if (parts[2].length === 1) {
                year = "200" + parts[2];
            } else if (parts[2].length === 2) {
                year = "20" + parts[2];
            } else {
                year = parts[2];
            }
            return customDateParser(Number.parseInt(year), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0]));
        } else {
            if (parts.length === 2) {
                return customDateParser((new Date(Date.now())).getFullYear(), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0]));
            } else {
                return null;
            }
        }
    }
}

export function parseDate(input: string): Date { // dd-mm-yy | yy/mm/dd
    if (input) {
        if (input.indexOf("-") > -1) {
            if (input.indexOf("/") === -1) {
                return parseByCharacter(input, '-');
            }
        } else if (input.indexOf("/") > -1) {
            if (input.indexOf("-") === -1) {
                return parseByCharacter(input, '/');
            }
        }
    }
    return null;
}

export function trimYear(input: Date): string {
    if (input) {
        if (input.toString() !== "Invalid Date") {
            return new Date(input).toLocaleDateString("it-IT", {
                month: 'numeric',
                day: 'numeric'
            });
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function createLengthValidator(minLength?, maxLength?, exceptLength?) {
    return (control: FormControl) => {
        const val = (control == null || control.value == null ||
            (minLength == null || control.value.length >= minLength)
            && (maxLength == null || control.value.length <= maxLength)
            && (exceptLength == null || control.value.length !== exceptLength));
        return val ? null : { lenghtError: true };
    };
}

export function createValueValidator(minValue?, maxValue?, exceptValue?) {
    return (control: FormControl) => {
        const val = (control == null || control.value == null ||
            (minValue == null || control.value >= minValue)
            && (maxValue == null || control.value <= maxValue)
            && (exceptValue == null || control.value != exceptValue));
        return val ? null : { sizeError: true };
    };
}

export function createValidationFunction(validator: string) {
    if (validator.indexOf("validateDate") > -1) {
        return dateValidator;
    } else {
        const regExp: RegExp = <RegExp>CUSTOM_PATTERN_VALIDATORS[validator];
        return function validationFunction(value) {
            return regExp.test(value) ? null : {
                valid: false
            };
        }
    }
}

export const CUSTOM_PATTERN_VALIDATORS = {
    stringValidator: <RegExp>/^([A-Za-z0-99À-ÿ� ,.:/';+!?|)(_\n-]*)*$/,
    telephoneValidator: <RegExp>/^([+]([0-9][0-9][\s])?)?([0-9]*(\s)?[0-9]*)$/,
    mailValidator: <RegExp>/(^$|^.*@.*\..*$)/,
    numberValidator: <RegExp>/^(-)?[0-9]*([.][0-9]*)?$/,
    urlValidator: <RegExp>/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    dateWithoutYearValidator: <RegExp>/^[0-9]{1,2}(-|\/)?[0-9]{1,2}$/,
    objectID: <RegExp>/^[0-9a-fA-F]{24}$/
}

export function createFileNameValidator(pattern: RegExp) {
    return (c: FormControl) => {
        if (pattern && c.value && c.value.name) {
            if (c.value.name.indexOf(".") > -1) {
                const parts = c.value.name.split(".");
                let name = "";
                for (let i = 0; i < (parts.length - 1); i++) {
                    name += parts[i] + ".";
                }
                name = name.substr(0, name.length - 1);
                return pattern.test(name) ? null : { fileName: true };
            } else {
                return { fileName: true };
            }
        } else {
            return null;
        }
    }
}

export function createfileSizeValidator(minValue?, maxValue?, exceptValue?) {
    maxValue = maxValue || FILE_SIZE_LIMIT;
    const validator = createValueValidator(minValue, maxValue, exceptValue);
    return (c: FormControl) => {
        if (c && c.value) {
            return validator(<any>{ value: c.value.size });
        } else {
            return null;
        }
    }
}

export const FILE_SIZE_LIMIT = 1024 * 1024 * 16;

export function hasRequiredValidator(control: AbstractControl, newValidators?: ValidatorFn | ValidatorFn[]): boolean {
    if (newValidators !== undefined) {
        if (newValidators !== null) {
            if (Array.isArray(newValidators)) {
                const errors = newValidators.map(val => val({} as AbstractControl));
                if (errors.find(err => err.required)) {
                    return true;
                }
            } else {
                const errors = newValidators({} as AbstractControl);
                if (errors && errors.required) {
                    return true;
                }
            }
        }
    } else if (control.validator) {
        const errors = control.validator({} as AbstractControl);
        if (errors && errors.required) {
            return true;
        }
    }
    return false;
}

export abstract class BcBaseInput implements ControlValueAccessor, OnInit {
    invalid = false;
    @Input() formControlName;
    @Input() value;
    @Input() enableBlock = false;
    @Input() title = "";
    isDisabled = false;
    private _placeholder;
    required = false;
    @Input() defaultContent = "";
    @Input() noName = false;
    @Input() errorMessage: string;
    _displayError = false;
    protected self: BcBaseInput;
    protected control: AbstractControl;
    propagateChange = (_: any) => { };

    constructor(@Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer) { }

    updateValidators(control?: AbstractControl, newValidators?: ValidatorFn | ValidatorFn[]) {
        if (control) {
            this.required = hasRequiredValidator(control, newValidators);
            control.updateValueAndValidity()
        } else {
            this.control.updateValueAndValidity();
        }
    }

    ngOnInit() {
        if (this.controlContainer) {
            if (this.formControlName) {
                this.control = <AbstractControl>this.controlContainer.control.get(this.formControlName);
                this.control.statusChanges.subscribe(status => {
                    if (status === 'INVALID') {
                        if (this.displayError) {
                            this.invalid = true;
                        }
                    } else if (status === 'VALID') {
                        this.invalid = false;
                    }
                });

                const originalFn = this.control.setValidators;
                this.control.setValidators = (newValidators: ValidatorFn | ValidatorFn[]) => {
                    const result = originalFn.apply(this.control, newValidators);
                    this.updateValidators(this.control, newValidators);
                    return result;

                }
                this.updateValidators(this.control);
            } else {
                console.warn('Missing FormControlName directive from host element of the component');
            }
        } else {
            console.warn('Can\'t find parent FormGroup directive');
        }
    }

    @Input() set displayError(enable: boolean) {
        this._displayError = enable;
        let val;
        if (this.control && this.control.validator) {
            val = this.control.validator(<any>{ value: this.value });
        } else {
            val = this.validatorFn(<any>{ value: this.value });
        }
        if (val != null && enable) {
            this.invalid = true;

        }
    }

    get displayError() {
        return this._displayError;
    }

    @Input() set placeholder(value) {
        if (value) {
            this._placeholder = value;
        } else {
            this._placeholder = "";
        }
    }

    get placeholder() {
        if (this._placeholder) {
            return this._placeholder;
        } else {
            return "";
        }
    }

    writeValue(value: any): void {
        this.updateValue(value);
    }

    registerOnChange(fn: any): void {
        if (!this.isDisabled) {
            this.propagateChange = fn;
        }
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    protected setValue(value) {
        if (!this.isDisabled) {
            this.value = value;
        }
    }

    protected updateValue(value) {
        if (!this.isDisabled) {
            this.setValue(value);
            this.propagateChange(this.value);
        }
    }

    protected validate(c: FormControl) {
        // this.updateValue(c.value);
        return this.validatorFn(c);
    }

    protected abstract validatorFn(c: FormControl);
}
