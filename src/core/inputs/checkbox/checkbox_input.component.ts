import {
    Component,
    Input,
    forwardRef,
    ViewEncapsulation
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    FormControl,
    NG_VALIDATORS,
    NG_ASYNC_VALIDATORS,
    FormGroup
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import {
    BcBaseInput
} from '../input_base';
import { ValidationError } from 'mongoose';

@Component({
    moduleId: module.id,
    selector: 'bc-checkbox-input',
    templateUrl: 'checkbox_input.component.html',
    styleUrls: ['checkbox_input.component.scss'],
    host: {
        'role': 'checkboxinput',
        '[class.bc-checkbox-input]': 'true'
    },
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcCheckboxInput),
        multi: true
    }],
    encapsulation: ViewEncapsulation.None
})
export class BcCheckboxInput extends BcBaseInput {

    isChecked(value?) {
        const val = ((value === undefined || value === null) ? this.value : value) || false;
        if (val) {
            if (val === "true" || val === true) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    onChange(event: any) {
        this.updateValue(this.isChecked(event.target.checked));
    }

    protected validatorFn(c: FormControl) {
        return null;
    }
}
