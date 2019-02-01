import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcTextInput,
    BcTextInputErrorStyler,
    BcTextInputSingleLineDirective
} from './text_input.component';
import {
    createValidationFunction, CUSTOM_PATTERN_VALIDATORS
} from '../input_base';
import {
    By
} from '@angular/platform-browser';
import { FormControl, Validators } from '@angular/forms';

describe('BcTextInput', () => {
    beforeEach(async (() => {
        TestBed.configureTestingModule({
            declarations: [BcTextInput, BcTextInputErrorStyler, BcTextInputSingleLineDirective]
        }).compileComponents();
    }));

    describe("Common", () => {
        it('Should not propagate changes if isDisabled', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.isDisabled = true;
            fixture.detectChanges();
            expect(app.isDisabled).toBe(true);
            app.onKey({
                target: {
                    value: "roba"
                }
            });
            expect(app.value).toBe(null);
        });

        it('Should raise error if empty and required', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.control = new FormControl(null, Validators.required);
            app.updateValidators();
            expect(app.control.invalid).toBe(true);
        });

        it('Should update current value if validator is correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validate({
                value: "roba"
            });
            expect(app.value).toBe("roba");
            app.onKey({
                target: {
                    value: "altraroba"
                }
            });
            expect(app.value).toBe("altraroba");
        });

        it('Should not update value if incorrect', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.control = new FormControl(null, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator));
            app.control.setValue("<>32");
            expect(app.value).toBe(null);
        });

    });

    it('Should remove year from date if required', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        expect(app.processYear("2/2/2")).toBe("2/2");
        expect(app.processYear("2/2")).toBe("2/2");
        expect(app.processYear()).toBe("");
        expect(app.processYear("robe")).toBe("robe");
        expect(app.processYear("-1")).toBe("-1");
    });

    it('Should have default stringValidator as default', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        expect(app._validator.toString()).toBe(createValidationFunction("stringValidator").toString());
    });

    it('Should not display error if disabled or value is correct', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        const err = fixture.debugElement.query(By.css(".bc-alert"));
        app.control = new FormControl(null, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator));
        app.control.setValue("<>32");
        fixture.detectChanges();
        expect(err.nativeElement.hidden).toBeTruthy();
        app.displayError = true;
        app.enableBlock = true;
        app.control.setValue("32");
        fixture.detectChanges();
        expect(err.nativeElement.hidden).toBeTruthy();
    });
});
