import {
    Component,
    Input,
    forwardRef,
    ViewEncapsulation
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    FormControl
} from '@angular/forms';
import {
    BcBaseInput
} from '../input_base';

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
    isChecked(value ? ) {
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
        this.setValue(this.isChecked(event.target.checked));
    }
}
