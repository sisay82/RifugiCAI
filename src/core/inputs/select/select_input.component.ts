import {
    Component,
    Input,
    forwardRef,
    ViewEncapsulation,
    Directive
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    FormControl,
    NG_VALIDATORS,
    NG_ASYNC_VALIDATORS
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {
    Enums
} from '../../../app/shared/types/enums';
import {
    BcBaseInput
} from '../input_base';
import { ValidationError } from 'mongoose';

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
    host: {
        'role': 'selectinput',
        '[class.bc-select-input]': 'true'
    },
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcSelectInput),
        multi: true
    }],
    encapsulation: ViewEncapsulation.None
})
export class BcSelectInput extends BcBaseInput {
    @Input() enumName: string;
    @Input() enumValues: any[] = [];

    getEnumKeys(key?: String) {
        const parts = (key || this.enumName).split('.');
        let enumKey;
        if (parts.length > 1) {
            enumKey = Enums;
            for (const part of parts) {
                enumKey = enumKey[part]
            }
        } else {
            enumKey = Enums[parts[0]];
        }
        return enumKey;
    }

    getEnumNames() {
        if (this.isDisabled && this.value) {
            return [this.value];
        } else {
            if (this.enumName) {
                const names: any[] = [];
                const enumKey = this.getEnumKeys();
                const objValues = Object.keys(enumKey).map(k => enumKey[k]);
                objValues.filter(v => typeof v === "string").forEach((val) => {
                    names.push(val);
                });
                return names;
            } else if (this.enumValues) {
                return this.enumValues;
            } else {
                return []
            }
        }
    }

    checkEnumValue(value) {
        if (value) {
            if (this.value && this.value.toString().toLowerCase().indexOf(value.toString().toLowerCase()) > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return value === this.value;
        }
    }

    onChange(event: any) {
        const value = event.target.value;
        if (!this.isDisabled) {
            if (value === "" && this.required) {
                if (this.displayError) {
                    this.invalid = true;
                }
            } else {
                this.invalid = false;
            }
        }
        this.updateValue(value);
    }

    protected validatorFn(c: FormControl) {
        return null;
    }
}
