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
    NG_VALIDATORS,
    AbstractControl,
    ControlContainer,
    NG_ASYNC_VALIDATORS
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import {
    BcBaseInput,
    parseDate,
    CUSTOM_PATTERN_VALIDATORS,
    trimYear,
    createValidationFunction
} from '../input_base';
import { ValidationError } from 'mongoose';

@Directive({
    selector: 'textarea[bc-enable-error]',
    host: {
        '[class.invalid]': 'invalid'
    }
})
export class BcTextInputErrorStyler {
    @Input('bc-enable-error') invalid: boolean;
}

@Directive({
    selector: 'textarea[bc-single-line]',
    host: {
        '[class.single-line]': 'enable'
    }
})
export class BcTextInputSingleLineDirective {
    @Input('bc-single-line') enable: boolean;
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
    @Input() lines: number;
    _validator: Function = createValidationFunction("stringValidator");

    @Input() set validator(validator) {
        this._validator = createValidationFunction(validator);
    }

    // override
    updateValue(value) {
        let newVal = value;
        if (this.removeYear) {
            newVal = this.processYear(value);
        }
        this.setValue(newVal);
        this.propagateChange(newVal);
    }

    onKey(event: any) {
        this.updateValue(event.target.value);
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

    getLines() {
        if (!this.lines) {
            return 1;
        } else {
            return this.lines
        }
    }

    isRequired() {
        return this.required
    }

    isSingleLine() {
        return !(this.lines && this.lines > 1);
    }

    getValue() {
        let returnVal;
        if (this.value === true || this.value === "true") {
            returnVal = 'si';
        } else if (this.value === "false" || (this.value === false && this.value !== "")) {
            returnVal = 'no';
        } else {
            if (this.replaceDot && this.value) {
                returnVal = (String(this.value)).replace(/\,/g, '.')
            } else {
                returnVal = this.value;
            }
        }
        if (!this.initialized) {
            this.initialized = true;
        }
        return returnVal;
    }

    validatorFn(c?: FormControl) {
        const value = c ? (c.value || this.value) : this.value;
        if (!this.removeYear || CUSTOM_PATTERN_VALIDATORS.dateWithoutYearValidator.test(value)) {
            if (c && c.value !== null) {
                this.setValue(c.value);
            }
            this.invalid = false;
            return null;
        } else {
            if (this.displayError) {
                this.invalid = true;
            }
            return {
                removeYear: true
            };
        }
    }
}
