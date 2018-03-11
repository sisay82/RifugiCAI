import {
    Component,
    Input,
    forwardRef,
    Directive,
    ViewEncapsulation
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    FormControl,
    NG_VALIDATORS
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    BcBaseInput,
    parseDate,
    createValidationFunction,
    validators,
    trimYear
} from '../input_base';

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
    host: {
        'role': 'textinput',
        '[class.bc-text-input]': 'true'
    },
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcTextInput),
        multi: true
    }, {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => BcTextInput),
        multi: true
    }],
    encapsulation: ViewEncapsulation.None
})
export class BcTextInput extends BcBaseInput {
    private initialized = false;
    @Input() removeYear = false;
    @Input() replaceDot = false;
    value = null;
    @Input() minLength: number;
    @Input() maxLength: number;
    @Input() minValue: number;
    @Input() maxValue: number;
    @Input() except: number;
    _validator: Function = createValidationFunction("stringValidator");

    @Input() set validator(validator) {
        this._validator = createValidationFunction(validator);
    }

    // override
    setValue(value) {
        if (!this.isDisabled) {
            if (this.removeYear) {
                this.value = this.processYear(value);
            } else {
                this.value = value;
            }
            this.propagateChange(this.value);
        }
    }

    onKey(event: any) {
        this.setValue(event.target.value);
    }

    processYear(value: string): string {
        if (value) {
            const date = parseDate(value);
            if (date) {
                if (date.toString() !== "Invalid Date") {
                    return trimYear(date);
                } else {
                    return value;
                }
            } else {
                return value;
            }
        } else {
            return "";
        }
    }

    getValue() {
        let returnVal;
        if (this.value === true || this.value === "true") {
            returnVal = 'si';
        } else if (this.value === "false" || (this.value === false && this.value !== "")) {
            returnVal = 'no';
        } else {
            /*if(this.removeYear&&!this.initialized){
                returnVal = this.processYear(this.value);
            } else*/
            if (this.replaceDot) {
                returnVal = ( < String > this.value).replace(/\,/g, '.')
            } else {
                returnVal = this.value;
            }
        }
        if (!this.initialized) {
            this.initialized = true;
        }
        return returnVal;
    }

    validate(c ?: FormControl): null | {
        valid ?: Boolean,
        err ?: String
    } {
        const value = c ? (c.value || this.value) : this.value;
        if (
            (!this.required || value) &&
            ((!this.required && !value) ||
                (
                    (this._validator(value) === null) &&
                    (!this.minLength || (value && value.length >= this.minLength)) &&
                    (!this.maxLength || (value && value.length <= this.maxLength)) &&
                    (!this.minValue || (value && value >= this.minValue)) &&
                    (!this.maxValue || (value && value <= this.maxValue)) &&
                    (!this.removeYear || validators.dateWithoutYearValidator.test(value)) &&
                    (!this.except || (value && value !== this.except))
                ))
        ) {
            this.invalid = false;
            if (c && c.value !== null) {
                this.setValue(c.value);
            }
            return null;
        } else {
            if (this.displayError) {
                this.invalid = true;
            }
            return {
                valid: false
            };
        }

    }
}
