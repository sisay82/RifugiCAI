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
    AbstractControl,
    ValidatorFn,
    AsyncValidatorFn,
    NG_ASYNC_VALIDATORS
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import {
    Enums
} from '../../../app/shared/types/enums';
import {
    BcBaseInput
} from '../input_base';
import { AbstractControlOptions } from '@angular/forms/src/model';
import { ValidationError } from 'mongoose';

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
    host: {
        'role': 'fileinput',
        '[class.bc-file-input]': 'true'
    },
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BcFileInput),
        multi: true
    }, {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => BcFileInput),
        multi: true
    }],
    encapsulation: ViewEncapsulation.None
})
export class BcFileInput extends BcBaseInput {
    @Input() optionalMessage: string;
    messageBlock: string;
    _contentType: String;
    types: String[];

    @Input() set contentType(value: String[]) {
        if (value.length > 0) {
            this.types = value;
            this._contentType = value.join(",");
        } else {
            this.types = null;
            this._contentType = null;
        }
    }

    getAcceptables() {
        return this._contentType;
    }

    onChange(event) {
        let files = [];
        if (event.target && event.target.files) { files = event.target.files }
        if (event.srcElement && event.srcElement.files) { files = event.srcElement.files }
        this.updateValue(files[0]);
    }

    getExtension(filename: String) {
        const parts = filename.split('.');
        return parts[parts.length - 1];
    }

    checkExtension(value: String) {
        if (this.types) {
            return this.types.includes(value.toLowerCase());
        } else {
            return true;
        }
    }

    validatorFn(c: FormControl) {
        if (c.value) {
            if (this.checkExtension(this.getExtension(c.value.name))) {
                this.invalid = false;
                return null;
            } else {
                if (this.displayError) {
                    this.invalid = true;
                }
                this.messageBlock = this.errorMessage;
                return {
                    err: "Invalid content"
                };
            }
        }
    }
}
