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
    NG_VALIDATORS
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    Enums
} from '../../../app/shared/types/enums';
import {
    BcBaseInput
} from '../input_base';

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
    @Input() validator: RegExp;
    @Input() sizeLimit: number = 1024 * 1024 * 16;
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
        this.setValue(files[0]);
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

    testName(value: string) {
        if (this.validator) {
            if (value.indexOf(".") > -1) {
                const parts = value.split(".");
                let name = "";
                for (let i = 0; i < (parts.length - 1); i++) {
                    name += parts[i] + ".";
                }
                name = name.substr(0, name.length - 1);
                return this.validator.test(name);
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    validate(c: FormControl): null | { valid?: Boolean, err?: String } {
        if (c.value) {
            if (
                (this.testName(c.value.name)) &&
                (c.value.size > 0) &&
                (this.checkExtension(this.getExtension(c.value.name)))) {
                this.setValue(c.value);
                if (this.value.size > this.sizeLimit) {
                    if (this.displayError) {
                        this.invalid = true;
                    }
                    this.messageBlock = this.optionalMessage;
                    return {
                        err: "Size over limit"
                    };
                } else {
                    this.invalid = false;
                    return null;
                }
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
