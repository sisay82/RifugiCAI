import {
    Input
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl
} from '@angular/forms';

function validateDate(value) {
    if (value) {
        const date = parseDate(value);
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

function customDateParser(val, month ? , day ? ) {
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

export function createValidationFunction(validator: string) {
    if (validator.indexOf("validateDate") > -1) {
        return validateDate;
    } else {
        const regExp: RegExp = < RegExp > validators[validator];
        return function validationFunction(value) {
            return regExp.test(value) ? null : {
                valid: false
            };
        }
    }
}

export const validators = {
    stringValidator: < RegExp > /^([A-Za-z0-99À-ÿ� ,.:/';+!?|)(_-]*)*$/,
    telephoneValidator: < RegExp > /^([+]([0-9][0-9][\s])?)?([0-9]*(\s)?[0-9]*)$/,
    mailValidator: < RegExp > /(^$|^.*@.*\..*$)/,
    numberValidator: < RegExp > /^(-)?[0-9]*([.][0-9]*)?$/,
    urlValidator: < RegExp > /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    dateWithoutYearValidator: < RegExp > /^[0-9]{1,2}(-|\/)?[0-9]{1,2}$/,
    objectID: < RegExp > /^[0-9a-fA-F]{24}$/
}

export abstract class BcBaseInput implements ControlValueAccessor {
    invalid = false;
    @Input() value;
    @Input() enableBlock = false;
    @Input() title = "";
    isDisabled = false;
    private _placeholder;
    @Input() required = false;
    @Input() defaultContent = "";
    @Input() noName = false;
    @Input() errorMessage: string;
    _displayError = false;

    propagateChange = (_: any) => {};

    @Input() set displayError(enable: boolean) {
        this._displayError = enable;
        if (this.required && this.value === "") {
            if (enable) {
                this.invalid = true;
            }
        } else {
            this.invalid = false;
        }
        this.validate( < FormControl > {
            value: this.value
        });
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

    registerOnTouched(fn: any): void {}

    setDisabledState ? (isDisabled: boolean): void {
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

    protected validate(c: FormControl): null | {
        valid ?: Boolean,
        err ?: String
    } {
        this.updateValue(c.value)
        return null;
    }
}
